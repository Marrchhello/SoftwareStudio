from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session
from datetime import timedelta
from auth import (
    Token, 
    authenticate_user, 
    create_access_token, 
    get_current_active_user, 
    UserAuth,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from user_managment import create_user
from Database import Roles
from db_session import get_db, engine, db
import os

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db_session: Session = Depends(get_db)
):
    user = authenticate_user(db_session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": str(user["user_id"]),
        "role": str(user["role"]),
        "role_id": int(user["role_id"])
    }
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/register")
async def register_info():
    return {
        "message": "Registration endpoint information",
        "method": "POST",
        "required_fields": {
            "role": "string (STUDENT or TEACHER)",
            "user_id": "integer",
            "email": "string"
        },
        "optional_fields": {
            "name": "string (required for TEACHER)",
            "title": "string (required for TEACHER)",
            "semester": "integer (1-8, default: 1, for STUDENT only)",
            "year": "integer (1-4, default: 1, for STUDENT only)"
        }
    }

@router.post("/register")
async def register(
    role: str,
    role_id: int,
    username: str,
    password: str
):
    res, err = create_user(engine=engine, roleId=role_id, username=username, password=password, role=Roles(role.lower()))
    if not res:
        raise HTTPException(status_code=400, detail=err)
    return {"message": err}

@router.get("/login")
async def login_info():
    return {
        "message": "Login endpoint information",
        "method": "POST",
        "required_fields": {
            "user_id": "integer"
        },
        "note": "For token-based authentication, use /token endpoint with username and password"
    }

@router.post("/login")
async def login(user_id: int):
    role, user = db.login_user(user_id)
    if role:
        return {"role": role, "user": user}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/me", response_model=UserAuth)
async def read_users_me(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    try:
        return UserAuth(
            user_id=int(current_user.user_id),
            role=str(current_user.role),
            role_id=int(current_user.role_id)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )