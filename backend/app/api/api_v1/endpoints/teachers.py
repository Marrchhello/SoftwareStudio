from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.database import get_db
from app.schemas.user import Teacher, TeacherCreate
from app.db import models

router = APIRouter()

@router.post("/", response_model=Teacher)
def create_teacher(
    *,
    db: Session = Depends(get_db),
    teacher_in: TeacherCreate,
) -> Any:
    """
    Create new teacher.
    """
    teacher = db.query(models.Teacher).filter(models.Teacher.email == teacher_in.email).first()
    if teacher:
        raise HTTPException(
            status_code=400,
            detail="The teacher with this email already exists in the system.",
        )
    teacher = models.Teacher(
        email=teacher_in.email,
        hashed_password=get_password_hash(teacher_in.password),
        name=teacher_in.name,
        title=teacher_in.title,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher

@router.get("/", response_model=List[Teacher])
def read_teachers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve teachers.
    """
    teachers = db.query(models.Teacher).offset(skip).limit(limit).all()
    return teachers

@router.get("/{teacher_id}", response_model=Teacher)
def read_teacher(
    *,
    db: Session = Depends(get_db),
    teacher_id: int,
) -> Any:
    """
    Get teacher by ID.
    """
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )
    return teacher

@router.put("/{teacher_id}", response_model=Teacher)
def update_teacher(
    *,
    db: Session = Depends(get_db),
    teacher_id: int,
    teacher_in: TeacherCreate,
) -> Any:
    """
    Update a teacher.
    """
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )
    
    # Check if email is already taken by another teacher
    if teacher_in.email != teacher.email:
        existing_teacher = db.query(models.Teacher).filter(models.Teacher.email == teacher_in.email).first()
        if existing_teacher:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
    
    # Update teacher data
    teacher.email = teacher_in.email
    teacher.name = teacher_in.name
    teacher.title = teacher_in.title
    if teacher_in.password:
        teacher.hashed_password = get_password_hash(teacher_in.password)
    
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher

@router.delete("/{teacher_id}", response_model=Teacher)
def delete_teacher(
    *,
    db: Session = Depends(get_db),
    teacher_id: int,
) -> Any:
    """
    Delete a teacher.
    """
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )
    db.delete(teacher)
    db.commit()
    return teacher 