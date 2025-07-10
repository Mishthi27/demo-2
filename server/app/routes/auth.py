from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.models.user import User
from app.utils.jwt import create_access_token
from passlib.context import CryptContext
from typing import Literal

router = APIRouter()

# Use sha256_crypt instead of bcrypt to avoid version issues
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["field_worker", "admin", "analyst"]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=dict)
async def register(payload: RegisterRequest):
    existing = await User.find_one(User.email == payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed, role=payload.role)
    await user.insert()
    return {"message": "User registered"}

@router.post("/login", response_model=dict)
async def login(payload: LoginRequest):
    user = await User.find_one(User.email == payload.email)
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role} 