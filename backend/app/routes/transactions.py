from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.database import get_supabase
from app.models.schemas import Transaction, TransactionCreate
from typing import Optional
import csv
import io
from datetime import date

router = APIRouter()


@router.get("/", response_model=list[Transaction])
def get_transactions(
    name_search: Optional[str] = Query(None),
    category_name: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    sb = get_supabase()
    res = sb.table("transactions").select(
        "id, committee_decision, amount, committee_date, notes, created_at, "
        "members(id, name), categories(id, name)"
    ).order("created_at", desc=True).execute()

    rows = res.data or []
    results = []

    for r in rows:
        member = r.get("members") or {}
        category = r.get("categories") or {}
        member_name = member.get("name", "")
        cat_name = category.get("name", "")

        if name_search and name_search.lower() not in member_name.lower():
            continue
        if category_name and category_name not in ("كل الفئات", "None", None, ""):
            if cat_name != category_name:
                continue

        effective_date = r.get("committee_date") or (r.get("created_at") or "")[:10]
        if date_from and effective_date < str(date_from):
            continue
        if date_to and effective_date > str(date_to):
            continue

        results.append({
            "id": r["id"],
            "member_id": member.get("id"),
            "member_name": member_name,
            "category_id": category.get("id"),
            "category_name": cat_name,
            "committee_decision": r["committee_decision"],
            "amount": r["amount"],
            "committee_date": r.get("committee_date"),
            "notes": r.get("notes"),
            "created_at": r.get("created_at"),
        })

    return results


@router.get("/family/{member_id}", response_model=list[Transaction])
def get_family_transactions(member_id: int):
    sb = get_supabase()

    # Get spouse name
    member_res = sb.table("members").select("spouse_name").eq("id", member_id).execute()
    spouse_name = member_res.data[0]["spouse_name"] if member_res.data else None

    member_ids = [member_id]
    if spouse_name:
        spouse_res = sb.table("members").select("id").eq("name", spouse_name).execute()
        if spouse_res.data:
            member_ids.append(spouse_res.data[0]["id"])

    res = sb.table("transactions").select(
        "id, committee_decision, amount, committee_date, notes, created_at, "
        "members(id, name), categories(id, name)"
    ).in_("member_id", member_ids).order("created_at", desc=True).execute()

    results = []
    for r in res.data or []:
        member = r.get("members") or {}
        category = r.get("categories") or {}
        results.append({
            "id": r["id"],
            "member_id": member.get("id"),
            "member_name": member.get("name", ""),
            "category_id": category.get("id"),
            "category_name": category.get("name", ""),
            "committee_decision": r["committee_decision"],
            "amount": r["amount"],
            "committee_date": r.get("committee_date"),
            "notes": r.get("notes"),
            "created_at": r.get("created_at"),
        })
    return results


@router.post("/", response_model=Transaction, status_code=201)
def create_transaction(tx: TransactionCreate):
    sb = get_supabase()
    if tx.committee_decision == "مالي" and (tx.amount is None or tx.amount <= 0):
        raise HTTPException(status_code=422, detail="Amount required for financial decisions")
    data = tx.model_dump()
    if data.get("committee_date"):
        data["committee_date"] = str(data["committee_date"])
    res = sb.table("transactions").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create transaction")
    return {**res.data[0], "member_name": None, "category_name": None}


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int):
    sb = get_supabase()
    sb.table("transactions").delete().eq("id", transaction_id).execute()


@router.get("/export/csv")
def export_csv(
    name_search: Optional[str] = Query(None),
    category_name: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    transactions = get_transactions(name_search, category_name, date_from, date_to)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["الاسم", "الفئة", "قرار اللجنة", "المبلغ", "تاريخ اللجنة", "ملاحظات", "تاريخ التسجيل"])
    for t in transactions:
        writer.writerow([
            t["member_name"], t["category_name"], t["committee_decision"],
            t["amount"] or "", t["committee_date"] or "",
            t["notes"] or "", (t["created_at"] or "")[:10],
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )
