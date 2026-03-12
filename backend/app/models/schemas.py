from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date, datetime


class MemberBase(BaseModel):
    name: str = Field(..., min_length=1)
    membership_id: Optional[str] = None
    phone: Optional[str] = None
    spouse_name: Optional[str] = None
    address: Optional[str] = None
    work: Optional[str] = None
    is_private_work: int = 0
    location_status: Optional[str] = None
    other_church_name: Optional[str] = None


class MemberCreate(MemberBase):
    pass


class MemberUpdate(MemberBase):
    pass


class Member(MemberBase):
    id: int

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    member_id: int
    category_id: int
    committee_decision: str = "مالي"
    amount: Optional[float] = None
    committee_date: Optional[date] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

    @field_validator("committee_decision")
    @classmethod
    def decision_must_be_valid(cls, v):
        if v not in ("مالي", "مؤجل"):
            raise ValueError("Decision must be مالي or مؤجل")
        return v


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    member_name: Optional[str] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionFilters(BaseModel):
    name_search: Optional[str] = None
    category_name: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class ExportRow(BaseModel):
    member_name: str
    category_name: str
    committee_decision: str
    amount: Optional[float]
    committee_date: Optional[str]
    notes: Optional[str]
    created_at: Optional[str]
