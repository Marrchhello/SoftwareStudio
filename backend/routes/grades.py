from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import GradeListModel, GradePostModel, AssignmentPostModel, CourseAssignmentsListModel, AssignmentSubmissionPostModel
from auth import UserAuth, get_current_active_user
from Query import getStudentGrades, getStudentGradesForCourse, postGrade, postAssignment, getCourseAssignments, getCourseAssignmentsForStudent, postAssignmentSubmission
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

@router.get("/student/courses/{course_id}/grades", response_model=GradeListModel)
def student_course_grades_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return getStudentGradesForCourse(engine=engine, student_id=current_user.role_id, course_id=course_id)

@router.get("/student/courses/{course_id}/assignments", response_model=CourseAssignmentsListModel)
def student_course_assignments_get(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return getCourseAssignmentsForStudent(engine=engine, course_id=course_id, student_id=current_user.role_id)

@router.get("/course/{course_id}/student/{student_id}/grades", response_model=GradeListModel)
def teacher_student_course_grades_get(
    course_id: int,
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return getStudentGradesForCourse(engine=engine, student_id=student_id, course_id=course_id)

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