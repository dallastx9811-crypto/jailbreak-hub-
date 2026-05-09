# Jailbreak Hub

A full-stack iOS jailbreak info platform.

**Owner:** Dallas LeBlanc ([@dallastx9811-crypto](https://github.com/dallastx9811-crypto))

## Stack

- **Frontend:** React 19, Tailwind CSS, shadcn/ui, React Router
- **Backend:** Python, FastAPI, MongoDB
- **Deploy:** Render (backend), Vercel (frontend)

## Local Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add MONGO_URL and DB_NAME
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```
