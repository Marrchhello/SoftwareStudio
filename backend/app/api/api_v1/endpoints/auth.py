from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.db.database import get_db
from app.schemas.user import Token
from app.db import models

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Try to authenticate as student
    student = db.query(models.Student).filter(models.Student.email == form_data.username).first()
    if student and verify_password(form_data.password, student.hashed_password):
        if not student.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive account"
            )
        if student.locked_until and student.locked_until > datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is locked. Please try again later."
            )
        
        # Reset failed attempts on successful login
        student.failed_login_attempts = 0
        db.commit()
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                data={"sub": student.email, "user_type": "student"},
                expires_delta=access_token_expires
            ),
            "token_type": "bearer"
        }
    
    # Try to authenticate as teacher
    teacher = db.query(models.Teacher).filter(models.Teacher.email == form_data.username).first()
    if teacher and verify_password(form_data.password, teacher.hashed_password):
        if not teacher.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive account"
            )
        if teacher.locked_until and teacher.locked_until > datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is locked. Please try again later."
            )
        
        # Reset failed attempts on successful login
        teacher.failed_login_attempts = 0
        db.commit()
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                data={"sub": teacher.email, "user_type": "teacher"},
                expires_delta=access_token_expires
            ),
            "token_type": "bearer"
        }
    
    # If we get here, authentication failed
    # Increment failed attempts for the user if found
    if student:
        student.failed_login_attempts += 1
        if student.failed_login_attempts >= 5:
            student.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
    elif teacher:
        teacher.failed_login_attempts += 1
        if teacher.failed_login_attempts >= 5:
            teacher.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    ) 