from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.academic import Grade, GradeCreate
from app.db import models

router = APIRouter()

@router.post("/", response_model=Grade)
def create_grade(
    *,
    db: Session = Depends(get_db),
    grade_in: GradeCreate,
) -> Any:
    """Create new grade"""
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == grade_in.student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )
    
    # Verify assignment exists
    assignment = db.query(models.Assignment).filter(models.Assignment.id == grade_in.assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found",
        )
    
    grade = models.Grade(
        student_id=grade_in.student_id,
        assignment_id=grade_in.assignment_id,
        grade=grade_in.grade,
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

@router.get("/", response_model=List[Grade])
def read_grades(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all grades"""
    grades = db.query(models.Grade).offset(skip).limit(limit).all()
    return grades

@router.get("/student/{student_id}", response_model=List[Grade])
def read_student_grades(
    *,
    db: Session = Depends(get_db),
    student_id: int,
) -> Any:
    """Get grades for a specific student"""
    grades = db.query(models.Grade).filter(
        models.Grade.student_id == student_id
    ).all()
    return grades

@router.get("/{grade_id}", response_model=Grade)
def read_grade(
    *,
    db: Session = Depends(get_db),
    grade_id: int,
) -> Any:
    """Get grade by ID"""
    grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(
            status_code=404,
            detail="Grade not found",
        )
    return grade

@router.put("/{grade_id}", response_model=Grade)
def update_grade(
    *,
    db: Session = Depends(get_db),
    grade_id: int,
    grade_in: GradeCreate,
) -> Any:
    """Update a grade"""
    grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(
            status_code=404,
            detail="Grade not found",
        )
    
    grade.student_id = grade_in.student_id
    grade.assignment_id = grade_in.assignment_id
    grade.grade = grade_in.grade
    
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

@router.delete("/{grade_id}", response_model=Grade)
def delete_grade(
    *,
    db: Session = Depends(get_db),
    grade_id: int,
) -> Any:
    """Delete a grade"""
    grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(
            status_code=404,
            detail="Grade not found",
        )
    db.delete(grade)
    db.commit()
    return grade