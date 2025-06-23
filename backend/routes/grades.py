from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import GradeListModel, GradePostModel
from auth import UserAuth, get_current_active_user
from Query import getStudentGrades, getStudentGradesForCourse, postGrade
from db_session import engine
from sqlalchemy.orm import Session
from sqlalchemy import and_
from Database import CourseStudent, CourseTeacher

router = APIRouter()

# GET Student Grades for Specific Course
@router.get("/student/courses/{course_id}/grades", response_model=GradeListModel)
def student_course_grades_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGradesForCourse(engine=engine, student_id=current_user.role_id, course_id=course_id)


# GET Student Grades for Specific Course (Teacher access)
@router.get("/course/{course_id}/student/{student_id}/grades", response_model=GradeListModel)
def teacher_student_course_grades_get(
    course_id: int,
    student_id: int,
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
        
        # Check if student is enrolled in this course
        student_course = session.query(CourseStudent).filter(
            and_(
                CourseStudent.studentId == student_id,
                CourseStudent.courseId == course_id
            )
        ).first()
        
        if not student_course:
            raise HTTPException(
                status_code=403, 
                detail="Student is not enrolled in this course"
            )
    
    return getStudentGradesForCourse(engine=engine, student_id=student_id, course_id=course_id)


# GET All Student Grades
@router.get("/student/grades", response_model=GradeListModel)
def student_grades_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGrades(engine=engine, student_id=current_user.role_id)


# POST Grade (with model)
@router.post("/grade/")
def assignment_grade_model_post(
    model: GradePostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    try:
        result = postGrade(engine=engine, teacher_id=current_user.role_id, model=model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
