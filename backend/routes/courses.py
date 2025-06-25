from sqlalchemy.orm import Session
from Models import StudentCourseListModel, TeacherCourseListModel, CourseStudentsListModel, CourseScheduleViewModel
from Database import CourseTeacher
from auth import UserAuth
from auth import get_current_active_user
from Query import getTeacherCourses, getStudentCourses, getCourseStudents, deleteCourse, getCourseScheduleView
from sqlalchemy import and_
from db_session import engine
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
import os

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost:4243/postgres")

# GET All Student Courses
@router.get("/student/courses", response_model=StudentCourseListModel)
def student_courses_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentCourses(engine=engine, student_id=current_user.role_id)


# GET Teacher Courses
@router.get("/teacher/courses", response_model=TeacherCourseListModel)
def teacher_courses_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    
    try:
        result = getTeacherCourses(engine=engine, teacher_id=current_user.role_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# GET All Students for Course
@router.get("/course/{course_id}/students", response_model=CourseStudentsListModel)
def course_students_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    # Check if teacher is assigned to this course
    with Session(engine) as session:
        teacher_course = session.query(CourseTeacher).filter(
            and_(
                CourseTeacher.teacherId == current_user.role_id,
                CourseTeacher.courseId == course_id
            )
        ).first()
        
        if not teacher_course:
            raise HTTPException(
                status_code=403, 
                detail="Teacher is not assigned to this course"
            )
    
    return getCourseStudents(engine=engine, course_id=course_id)

# GET Course Schedule View
@router.get("/course/{course_id}/schedule-view", response_model=CourseScheduleViewModel)
def course_schedule_view_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    # Check if teacher is assigned to this course
    with Session(engine) as session:
        teacher_course = session.query(CourseTeacher).filter(
            and_(
                CourseTeacher.teacherId == current_user.role_id,
                CourseTeacher.courseId == course_id
            )
        ).first()
        
        if not teacher_course:
            raise HTTPException(
                status_code=403, 
                detail="Teacher is not assigned to this course"
            )
    
    return getCourseScheduleView(engine=engine, course_id=course_id)

# DELETE Course (Teacher only)
@router.delete("/course/{course_id}")
def course_delete(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    result = deleteCourse(engine=engine, teacher_id=current_user.role_id, course_id=course_id)
    
    if result["status_code"] != 200:
        raise HTTPException(status_code=result["status_code"], detail=result["detail"])
    
    return result