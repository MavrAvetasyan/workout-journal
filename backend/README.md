# Workout Journal Backend

FastAPI backend for the workout journal app.

## Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite for local development

## Run locally

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.app.main:app --reload
```

Open:

- Site: `http://127.0.0.1:8000`
- API: `http://127.0.0.1:8000/api`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Implemented in this phase

- registration
- login
- current user profile
- full dataset sync for the existing frontend
- exercises CRUD
- measurements CRUD
- workouts CRUD with nested workout exercises

## Notes

- local development database is created automatically in `backend/data/app.db`
- the site is served by FastAPI from `wwwroot`
- drafts are still stored on the frontend for now
