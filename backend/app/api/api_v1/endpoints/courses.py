from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.academic import Course, CourseCreate
from app.db import models

router = APIRouter()

@router.post("/", response_model=Course)
def create_course(
    *,
    db: Session = Depends(get_db),
    course_in: CourseCreate,
) -> Any:
    """
    Create new course.
    """
    # Verify teacher exists
    teacher = db.query(models.Teacher).filter(models.Teacher.id == course_in.teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )
    
    course = models.Course(
        name=course_in.name,
        ects=course_in.ects,
        semester=course_in.semester,
        room_number=course_in.room_number,
        teacher_id=course_in.teacher_id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/", response_model=List[Course])
def read_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    semester: int = None,
) -> Any:
    """
    Retrieve courses.
    """
    query = db.query(models.Course)
    if semester is not None:
        query = query.filter(models.Course.semester == semester)
    courses = query.offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=Course)
def read_course(
    *,
    db: Session = Depends(get_db),
    course_id: int,
) -> Any:
    """
    Get course by ID.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )
    return course

@router.put("/{course_id}", response_model=Course)
def update_course(
    *,
    db: Session = Depends(get_db),
    course_id: int,
    course_in: CourseCreate,
) -> Any:
    """
    Update a course.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )
    
    # Verify teacher exists
    teacher = db.query(models.Teacher).filter(models.Teacher.id == course_in.teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )
    
    # Update course data
    course.name = course_in.name
    course.ects = course_in.ects
    course.semester = course_in.semester
    course.room_number = course_in.room_number
    course.teacher_id = course_in.teacher_id
    
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", response_model=Course)
def delete_course(
    *,
    db: Session = Depends(get_db),
    course_id: int,
) -> Any:
    """
    Delete a course.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )
    db.delete(course)
    db.commit()
    return course

@router.post("/{course_id}/enroll/{student_id}")
def enroll_student(
    *,
    db: Session = Depends(get_db),
    course_id: int,
    student_id: int,
    group_number: int,
) -> Any:
    """
    Enroll a student in a course.
    """
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )
    
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )
    
    # Check if already enrolled
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.student_id == student_id
    ).first()
    if enrollment:
        raise HTTPException(
            status_code=400,
            detail="Student already enrolled in this course",
        )
    
    # Create enrollment
    enrollment = models.Enrollment(
        course_id=course_id,
        student_id=student_id,
        group_number=group_number
    )
    db.add(enrollment)
    
    # Create attendance record
    attendance = models.Attendance(
        course_id=course_id,
        student_id=student_id,
        classes_missed=0
    )
    db.add(attendance)
    
    db.commit()
    return {"message": "Student successfully enrolled in course"} 