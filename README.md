# نظام مساعدات كنيسة السيدة العذراء مريم 🏛️

Web application for managing church aid transactions — **لجنة البر**.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |

## Project Structure

```
masara-web/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # Supabase client
│   │   ├── models/
│   │   │   └── schemas.py   # Pydantic models
│   │   └── routes/
│   │       ├── members.py
│   │       ├── categories.py
│   │       └── transactions.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # MemberModal, TransactionModal, Layout
│   │   ├── pages/           # Dashboard, Members, MemberProfile
│   │   ├── services/        # api.ts (Axios wrappers)
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your SUPABASE_SERVICE_KEY
# Get it from: Supabase Dashboard → Project Settings → API → service_role key

# Run the API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

App available at: http://localhost:5173

### 3. Get Your Supabase Service Key

1. Go to https://supabase.com/dashboard
2. Open your project → **Project Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Paste into `backend/.env` as `SUPABASE_SERVICE_KEY`

> ⚠️ Never commit the service key to Git. It's in `.gitignore`.

## Features

- ✅ Full CRUD for Members and Transactions
- ✅ Filter transactions by name, category, and date range
- ✅ Family transaction history (member + spouse)
- ✅ CSV export of filtered transactions
- ✅ Arabic RTL interface
- ✅ RLS-secured Supabase tables

## GitHub Setup

```bash
cd masara-web

git init
git add .
git commit -m "feat: initial web app - React + FastAPI + Supabase"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/masara-web.git
git branch -M main
git push -u origin main
```
