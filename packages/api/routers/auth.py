import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from ..services.neo4j_service import neo4j_service

router = APIRouter(tags=["auth"])
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "supersecretkey_for_development_only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str = ""
    age_range: str = ""
    weight_range: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register")
async def register(user: UserCreate):
    user.email = user.email.lower()
    existing = await neo4j_service.get_patient_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    user_id = str(uuid.uuid4())

    new_user = await neo4j_service.create_patient_user(
        id=user_id,
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        age_range=user.age_range,
        weight_range=user.weight_range,
    )

    if not new_user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    # Log them in automatically
    token = create_access_token(data={"sub": new_user["id"], "email": new_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "first_name": new_user["first_name"],
            "last_name": new_user.get("last_name", ""),
        },
    }


@router.post("/login")
async def login(user: UserLogin):
    user.email = user.email.lower()
    db_user = await neo4j_service.get_patient_by_email(user.email)
    if not db_user or not db_user.get("hashed_password"):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": db_user["id"], "email": db_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "first_name": db_user["first_name"],
            "last_name": db_user.get("last_name", ""),
        },
    }


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    req.email = req.email.lower()
    db_user = await neo4j_service.get_patient_by_email(req.email)
    if not db_user:
        # Don't reveal if user exists or not for security
        return {"message": "If that email is registered, a reset token has been generated.", "reset_token": "hidden"}

    reset_token = secrets.token_urlsafe(32)
    expiry = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()

    success = await neo4j_service.set_password_reset_token(req.email, reset_token, expiry)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to generate reset token")

    # In a real app, send an email here. We return it for the mobile app to simulate deep linking.
    return {
        "message": "Reset token generated successfully.",
        "simulated_deep_link": f"cascadex://reset-password?token={reset_token}",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    hashed_password = pwd_context.hash(req.new_password)
    success = await neo4j_service.update_patient_password_with_token(req.token, hashed_password)

    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    return {"message": "Password updated successfully. You can now log in."}
