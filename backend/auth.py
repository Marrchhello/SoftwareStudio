from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from .database.InsertDeleteMenager import DatabaseManager
from .database.database_I import Student, Teacher
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

class UserCreate(BaseModel):
    user_id: int
    password: str
    role: str  # "student" or "teacher"
    email: Optional[str] = None
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id, role=role)
    except JWTError:
        raise credentials_exception
    
    db_manager = DatabaseManager()  # Initialize your DB manager
    if token_data.role == "student":
        user = db_manager.get_student_info(token_data.user_id)
    else:
        user = db_manager.get_teacher_info(token_data.user_id)
    
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    db_manager = DatabaseManager()  # Initialize your DB manager
    
    # Check if user already exists
    if user_data.role == "student":
        existing = db_manager.get_student_info(user_data.user_id)
    else:
        existing = db_manager.get_teacher_info(user_data.user_id)
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    if user_data.role == "student":
        db_manager.add_student(
            student_id=user_data.user_id,
            email=user_data.email,
            hashed_password=hashed_password
        )
    else:
        db_manager.add_teacher(
            teacher_id=user_data.user_id,
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password
        )
    
    return {"message": "User created successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db_manager = DatabaseManager()
    user_id = int(form_data.username)  # We're using user_id as username
    
    # Try student first
    student = db_manager.get_student_info(user_id)
    if student and verify_password(form_data.password, student.hashed_password):
        role = "student"
    else:
        # Try teacher
        teacher = db_manager.get_teacher_info(user_id)
        if teacher and verify_password(form_data.password, teacher.hashed_password):
            role = "teacher"
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect user ID or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id), "role": role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}