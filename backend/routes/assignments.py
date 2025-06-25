from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import AssignmentPostModel, CourseAssignmentsListModel, AssignmentSubmissionPostModel
from auth import UserAuth, get_current_active_user
from Query import postAssignment, getCourseAssignments, getCourseAssignmentsForStudent, postAssignmentSubmission, getAssignmentSubmissions, deleteAssignment
from db_session import engine
from sqlalchemy.orm import Session
from sqlalchemy import and_
from Database import CourseStudent, CourseTeacher

router = APIRouter()

# POST Assignment (with model)
@router.post("/assignment/")
def assignment_post(
    model: AssignmentPostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return postAssignment(engine=engine, teacher_id=current_user.role_id, model=model)


# GET All Assignments for Course (Student view with group filtering)
@router.get("/student/courses/{course_id}/assignments", response_model=CourseAssignmentsListModel)
def student_course_assignments_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    
    # Check if student is enrolled in this course
    with Session(engine) as session:
        student_course = session.query(CourseStudent).filter(
            and_(
                CourseStudent.studentId == current_user.role_id,
                CourseStudent.courseId == course_id
            )
        ).first()
        
        if not student_course:
            raise HTTPException(
                status_code=403, 
                detail="Student is not enrolled in this course"
            )
    
    return getCourseAssignmentsForStudent(engine=engine, course_id=course_id, student_id=current_user.role_id)


# GET All Assignments for Course (Teacher only)
@router.get("/course/{course_id}/assignments", response_model=CourseAssignmentsListModel)
def course_assignments_get(
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
    
    return getCourseAssignments(engine=engine, course_id=course_id)


@router.post("/student/{student_id}/courses/{course_id}/assignments/{assignment_id}/submission")
def post_assignment_submission(
    student_id: int, course_id: int, assignment_id: int, model: AssignmentSubmissionPostModel, current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    # Create a complete model with student_id and assignment_id from the URL path
    complete_model = AssignmentSubmissionPostModel(
        student_id=student_id,
        assignment_id=assignment_id,
        submission_link=model.submission_link
    )
    return postAssignmentSubmission(engine=engine, model=complete_model)


# GET Assignment Submissions (Teacher only)
@router.get("/course/{course_id}/assignment/{assignment_id}/submissions")
def assignment_submissions_get(
    course_id: int,
    assignment_id: int,
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
    
    result = getAssignmentSubmissions(engine=engine, course_id=course_id, assignment_id=assignment_id)
    
    if result["status_code"] != 200:
        raise HTTPException(status_code=result["status_code"], detail=result["detail"])
    
    return result


# DELETE Assignment (Teacher only)
@router.delete("/assignment/{assignment_id}")
def assignment_delete(
    assignment_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    result = deleteAssignment(engine=engine, teacher_id=current_user.role_id, assignment_id=assignment_id)
    
    if result["status_code"] != 200:
        raise HTTPException(status_code=result["status_code"], detail=result["detail"])
    
    return result 