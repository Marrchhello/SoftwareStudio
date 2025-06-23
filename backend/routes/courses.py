from Models import StudentCourseListModel, TeacherCourseListModel, CourseStudentsListModel, CourseScheduleViewModel
from auth import UserAuth
from auth import get_current_active_user
from Query import getTeacherCourses, getStudentCourses, getCourseStudents, getCourseScheduleView
from db_session import engine
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
import os

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost:4243/postgres")

@router.get("/student/courses", response_model=StudentCourseListModel)
def student_courses_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    try:
        return getStudentCourses(engine=engine, student_id=current_user.role_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/teacher/courses", response_model=TeacherCourseListModel)
def teacher_courses_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    try:
        return getTeacherCourses(engine=engine, teacher_id=current_user.role_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/course/{course_id}/students", response_model=CourseStudentsListModel)
def course_students_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    try:
        return getCourseStudents(engine=engine, course_id=course_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/course/{course_id}/schedule-view", response_model=CourseScheduleViewModel)
def get_course_schedule_view(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    try:
        return getCourseScheduleView(engine=engine, course_id=course_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 