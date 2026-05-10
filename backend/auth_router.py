from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
import uuid
from datetime import datetime, timezone, timedelta

SECRET_KEY = os.environ.get("JWT_SECRET", "jailbreak-hub-secret-change-in-production")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=3650)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def make_get_current_user(db):
    async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ):
        if not credentials:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            payload = jwt.decode(
                credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
            )
            user_id = payload.get("sub")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    return get_current_user


def make_auth_router(db):
    router = APIRouter(prefix="/api/auth")
    get_current_user = make_get_current_user(db)

    class RegisterRequest(BaseModel):
        email: EmailStr
        password: str

    class LoginRequest(BaseModel):
        email: EmailStr
        password: str

    @router.post("/register")
    async def register(req: RegisterRequest):
        existing = await db.users.find_one({"email": req.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        if len(req.password) < 6:
            raise HTTPException(
                status_code=400, detail="Password must be at least 6 characters"
            )
        user = {
            "id": str(uuid.uuid4()),
            "email": req.email.lower(),
            "password_hash": pwd_context.hash(req.password),
            "has_paid": False,
            "stripe_customer_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
        token = create_token(user["id"])
        return {
            "token": token,
            "user": {"id": user["id"], "email": user["email"], "has_paid": False},
        }

    @router.post("/login")
    async def login(req: LoginRequest):
        user = await db.users.find_one({"email": req.email.lower()})
        if not user or not pwd_context.verify(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_token(user["id"])
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "has_paid": user.get("has_paid", False),
            },
        }

    @router.get("/me")
    async def me(current_user=Depends(get_current_user)):
        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "has_paid": current_user.get("has_paid", False),
        }

    return router, get_current_user
