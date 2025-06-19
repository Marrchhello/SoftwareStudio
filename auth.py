from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", scheme_name="JWT")

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
    role_id: Optional[int] = None

# User authentication models
class UserAuth(BaseModel):
    user_id: int
    role: str
    role_id: int

# Password verification
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Handle bytes to string conversion if needed
        if isinstance(hashed_password, bytes):
            hashed_password = hashed_password.decode('utf-8')
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"DEBUG: Password verification error: {e}")
        return False

# Password hashing
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Authenticate user
def authenticate_user(db_session: Session, username: str, password: str) -> Optional[Dict[str, Any]]:
    try:
        print(f"DEBUG: Attempting authentication for username: {username}")
        # Query the database for the user
        query = select(User).where(User.username == username)
        result = db_session.execute(query).first()
        
        if not result:
            print(f"DEBUG: User not found: {username}")
            return None
        
        user = result[0]
        print(f"DEBUG: Found user: {user.userId}, role: {user.role.value}")
        
        # Handle password verification
        if not verify_password(password, user.password):
            print(f"DEBUG: Password verification failed for user: {username}")
            return None
        
        print(f"DEBUG: Authentication successful for user: {username}")
        
        # Return user information with consistent types
        return {
            "user_id": int(user.userId),  # Ensure it's an int
            "role": str(user.role.value),  # Ensure it's a string
            "role_id": int(user.roleId)    # Ensure it's an int
        }
    except Exception as e:
        print(f"DEBUG: Authentication error: {e}")
        return None

# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    try:
        to_encode = data.copy()
        
        # Force types in token payload
        print(f"DEBUG: Original token data: {to_encode}")
        
        # Convert values to required types
        if "sub" in to_encode:
            to_encode["sub"] = str(to_encode["sub"])  # Store as string in token
        if "role_id" in to_encode:
            to_encode["role_id"] = int(to_encode["role_id"])
        if "role" in to_encode:
            to_encode["role"] = str(to_encode["role"])
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode.update({"exp": expire})
        print(f"DEBUG: Creating token with payload: {to_encode}")
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        print(f"DEBUG: Token creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

# Get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserAuth:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        print("\nDEBUG: Token validation started")
        print(f"DEBUG: Raw token: {token[:20]}...")

        # Decode JWT token with explicit verification
        try:
            payload = jwt.decode(
                token, 
                SECRET_KEY, 
                algorithms=[ALGORITHM],
                options={"verify_signature": True, "verify_exp": True}
            )
            print(f"DEBUG: Successfully decoded payload: {payload}")
        except jwt.ExpiredSignatureError:
            print("DEBUG: Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError as jwt_error:
            print(f"DEBUG: JWT decode error: {jwt_error}")
            raise credentials_exception

        # Extract and validate required fields with type conversion
        try:
            # Get values from payload
            user_id_str = payload.get("sub")
            role = payload.get("role")
            role_id = payload.get("role_id")
            
            print(f"DEBUG: Raw values from payload:")
            print(f"- user_id_str: {user_id_str} (type: {type(user_id_str)})")
            print(f"- role: {role} (type: {type(role)})")
            print(f"- role_id: {role_id} (type: {type(role_id)})")
            
            # Validate presence
            if any(v is None for v in [user_id_str, role, role_id]):
                print("DEBUG: Missing required fields in token payload")
                raise credentials_exception
            
            # Convert types
            try:
                user_id = int(user_id_str)
                role = str(role)
                role_id = int(role_id)
            except (ValueError, TypeError) as e:
                print(f"DEBUG: Type conversion error: {e}")
                raise credentials_exception
            
            print(f"DEBUG: Converted values:")
            print(f"- user_id: {user_id} (type: {type(user_id)})")
            print(f"- role: {role} (type: {type(role)})")
            print(f"- role_id: {role_id} (type: {type(role_id)})")
            
        except Exception as e:
            print(f"DEBUG: Field extraction/validation error: {e}")
            raise credentials_exception

        token_data = TokenData(user_id=user_id, role=role, role_id=role_id)
        return UserAuth(user_id=user_id, role=role, role_id=role_id)

    except Exception as e:
        print(f"DEBUG: Unexpected error during token validation: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        raise credentials_exception

# Verify user is active
async def get_current_active_user(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
    print(f"DEBUG: Checking active user: {current_user}")
    return current_user

# Role-based access control
def get_user_with_role(required_role: str):
    async def role_checker(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
        print(f"DEBUG: Checking role. Required: {required_role}, User has: {current_user.role}")
        if current_user.role.lower() != required_role.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires role: {required_role}"
            )
        return current_user
    return role_checker
