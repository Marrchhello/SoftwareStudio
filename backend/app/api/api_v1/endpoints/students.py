from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.database import get_db
from app.schemas.user import Student, StudentCreate
from app.db import models

router = APIRouter()

@router.post("/", response_model=Student)
def create_student(
    *,
    db: Session = Depends(get_db),
    student_in: StudentCreate,
) -> Any:
    """
    Create new student.
    """
    student = db.query(models.Student).filter(models.Student.email == student_in.email).first()
    if student:
        raise HTTPException(
            status_code=400,
            detail="The student with this email already exists in the system.",
        )
    student = models.Student(
        email=student_in.email,
        hashed_password=get_password_hash(student_in.password),
        name=student_in.name,
        semester=student_in.semester,
        year=student_in.year,
        degree_id=student_in.degree_id,
        age=student_in.age,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/", response_model=List[Student])
def read_students(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve students.
    """
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}", response_model=Student)
def read_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
) -> Any:
    """
    Get student by ID.
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )
    return student

@router.put("/{student_id}", response_model=Student)
def update_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
    student_in: StudentCreate,
) -> Any:
    """
    Update a student.
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )
    
    # Check if email is already taken by another student
    if student_in.email != student.email:
        existing_student = db.query(models.Student).filter(models.Student.email == student_in.email).first()
        if existing_student:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
    
    # Update student data
    student.email = student_in.email
    student.name = student_in.name
    student.semester = student_in.semester
    student.year = student_in.year
    student.degree_id = student_in.degree_id
    student.age = student_in.age
    if student_in.password:
        student.hashed_password = get_password_hash(student_in.password)
    
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}", response_model=Student)
def delete_student(
    *,
    db: Session = Depends(get_db),
    student_id: int,
) -> Any:
    """
    Delete a student.
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )
    db.delete(student)
    db.commit()
    return student 