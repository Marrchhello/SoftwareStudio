from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.academic import Assignment, AssignmentCreate
from app.db import models

router = APIRouter()

@router.post("/", response_model=Assignment)
def create_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_in: AssignmentCreate,
) -> Any:
    """Create new assignment"""
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == assignment_in.course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )
    
    assignment = models.Assignment(
        course_id=assignment_in.course_id,
        due_date=assignment_in.due_date,
        type=assignment_in.type,
        description=assignment_in.description,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/", response_model=List[Assignment])
def read_assignments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all assignments"""
    assignments = db.query(models.Assignment).offset(skip).limit(limit).all()
    return assignments

@router.get("/student", response_model=List[Assignment])
def read_student_assignments(
    *,
    db: Session = Depends(get_db),
    student_id: int,
) -> Any:
    """Get assignments for a specific student"""
    # Get courses the student is enrolled in
    enrolled_courses = db.query(models.Enrollment.course_id).filter(
        models.Enrollment.student_id == student_id
    ).all()
    course_ids = [course_id for (course_id,) in enrolled_courses]
    
    # Get assignments for those courses
    assignments = db.query(models.Assignment).filter(
        models.Assignment.course_id.in_(course_ids)
    ).all()
    return assignments

@router.get("/{assignment_id}", response_model=Assignment)
def read_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_id: int,
) -> Any:
    """Get assignment by ID"""
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found",
        )
    return assignment

@router.put("/{assignment_id}", response_model=Assignment)
def update_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_id: int,
    assignment_in: AssignmentCreate,
) -> Any:
    """Update an assignment"""
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found",
        )
    
    assignment.course_id = assignment_in.course_id
    assignment.due_date = assignment_in.due_date
    assignment.type = assignment_in.type
    assignment.description = assignment_in.description
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.delete("/{assignment_id}", response_model=Assignment)
def delete_assignment(
    *,
    db: Session = Depends(get_db),
    assignment_id: int,
) -> Any:
    """Delete an assignment"""
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found",
        )
    db.delete(assignment)
    db.commit()
    return assignment