from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import GradeListModel, GradePostModel, AssignmentPostModel, CourseAssignmentsListModel, AssignmentSubmissionPostModel
from auth import UserAuth, get_current_active_user
from Query import getStudentGrades, postGrade, postAssignment, getCourseAssignments, postAssignmentSubmission
from db_session import engine

router = APIRouter()

@router.get("/student/grades", response_model=GradeListModel)
def student_grades_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return getStudentGrades(engine=engine, student_id=current_user.role_id)

@router.post("/grade/")
def assignment_grade_model_post(
    model: GradePostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return postGrade(engine=engine, teacher_id=current_user.role_id, model=model)

@router.post("/assignment/")
def assignment_post(
    model: AssignmentPostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return postAssignment(engine=engine, teacher_id=current_user.role_id, model=model)

@router.get("/course/{course_id}/assignments", response_model=CourseAssignmentsListModel)
def course_assignments_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return getCourseAssignments(engine=engine, course_id=course_id)

@router.post("/student/{student_id}/courses/{course_id}/assignments/{assignment_id}/submission")
def post_assignment_submission(
    student_id: int, course_id: int, assignment_id: int, model: AssignmentSubmissionPostModel, current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return postAssignmentSubmission(engine=engine, student_id=student_id, course_id=course_id, assignment_id=assignment_id, model=model) 