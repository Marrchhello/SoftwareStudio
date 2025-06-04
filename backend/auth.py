from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from Database import User

# Security configuration
SECRET_KEY = "0141bc81b542426afb1d83ba137c3b2f4ce24af700d82f4fdcd3a178ef59073c"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# User authentication models
class UserAuth(BaseModel):
    user_id: int
    role: str
    role_id: int

# Password verification
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Password hashing
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Authenticate user
def authenticate_user(db_session: Session, username: str, password: str) -> Optional[Dict[str, Any]]:
    # Query the database for the user
    query = select(User).where(User.username == username)
    result = db_session.execute(query).first()
    
    if not result:
        return None
    
    user = result[0]
    
    # Verify the password
    if not verify_password(password, user.password.decode('utf-8') if isinstance(user.password, bytes) else user.password):
        return None
    
    # Return user information
    return {
        "user_id": user.userId,
        "role": user.role.value,
        "role_id": user.roleId
    }

# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserAuth:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        role: str = payload.get("role")
        role_id: int = payload.get("role_id")
        
        if user_id is None or role is None:
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id, role=role)
        
    except JWTError:
        raise credentials_exception
    
    # Return user authentication data
    return UserAuth(user_id=token_data.user_id, role=token_data.role, role_id=role_id)

# Verify user is active
async def get_current_active_user(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
    # Add any additional checks for active users if needed
    return current_user

# Role-based access control
def get_user_with_role(required_role: str):
    async def role_checker(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires role: {required_role}"
            )
        return current_user
    return role_checker
