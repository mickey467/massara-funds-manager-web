from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import members, categories, transactions

app = FastAPI(
    title="Masara Church Aid API",
    description="API for كنيسة السيدة العذراء مريم - لجنة البر",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(members.router, prefix="/api/members", tags=["Members"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
