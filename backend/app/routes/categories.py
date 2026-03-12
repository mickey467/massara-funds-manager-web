from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import Category, CategoryCreate

router = APIRouter()

DEFAULT_CATEGORIES = ["زواج", "سكن", "مرض", "تعليم", "أخرى"]


@router.get("/", response_model=list[Category])
def get_all_categories():
    sb = get_supabase()
    res = sb.table("categories").select("*").order("name").execute()
    return res.data


@router.post("/seed", status_code=201)
def seed_categories():
    sb = get_supabase()
    for name in DEFAULT_CATEGORIES:
        existing = sb.table("categories").select("id").eq("name", name).execute()
        if not existing.data:
            sb.table("categories").insert({"name": name}).execute()
    return {"message": "Categories seeded"}


@router.post("/", response_model=Category, status_code=201)
def create_category(cat: CategoryCreate):
    sb = get_supabase()
    existing = sb.table("categories").select("id").eq("name", cat.name).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Category already exists")
    res = sb.table("categories").insert(cat.model_dump()).execute()
    return res.data[0]
