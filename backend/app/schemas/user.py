from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base schemas
class StudentBase(BaseModel):
    name: str
    email: str
    semester: int
    year: int
    degree_id: int
    age: int

class TeacherBase(BaseModel):
    name: str
    email: str
    title: str

# Create schemas
class StudentCreate(StudentBase):
    password: str

class TeacherCreate(TeacherBase):
    password: str

# Response schemas
class Student(StudentBase):
    id: int
    is_active: bool
    failed_login_attempts: int
    locked_until: Optional[datetime] = None

    class Config:
        from_attributes = True

class Teacher(TeacherBase):
    id: int
    is_active: bool
    failed_login_attempts: int
    locked_until: Optional[datetime] = None

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None  # "student" or "teacher" 