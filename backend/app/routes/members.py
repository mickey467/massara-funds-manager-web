from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import Member, MemberCreate, MemberUpdate

router = APIRouter()


@router.get("/", response_model=list[Member])
def get_all_members():
    sb = get_supabase()
    res = sb.table("members").select("*").order("name").execute()
    return res.data


@router.get("/{member_id}", response_model=Member)
def get_member(member_id: int):
    sb = get_supabase()
    res = sb.table("members").select("*").eq("id", member_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Member not found")
    return res.data[0]


@router.post("/", response_model=Member, status_code=201)
def create_member(member: MemberCreate):
    sb = get_supabase()
    # Check for duplicate name
    existing = sb.table("members").select("id").eq("name", member.name).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="عضو بهذا الاسم موجود بالفعل")
    res = sb.table("members").insert(member.model_dump()).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create member")
    return res.data[0]


@router.put("/{member_id}", response_model=Member)
def update_member(member_id: int, member: MemberUpdate):
    sb = get_supabase()
    # Check exists
    existing = sb.table("members").select("id").eq("id", member_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Member not found")
    res = sb.table("members").update(member.model_dump()).eq("id", member_id).execute()
    return res.data[0]


@router.delete("/{member_id}", status_code=204)
def delete_member(member_id: int):
    sb = get_supabase()
    sb.table("members").delete().eq("id", member_id).execute()
