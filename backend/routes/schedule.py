from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import ScheduleModel
from auth import UserAuth, get_current_active_user
from Query import getDayStudentSchedule, getWeekStudentSchedule, getMonthStudentSchedule, getDayTeacherSchedule, getWeekTeacherSchedule, getMonthTeacherSchedule, getSemesterStudentSchedule
from Util import convert_str_to_datetime
from db_session import engine

router = APIRouter()

# ----------------------------------------------------------------------------
# Student Schedule
# ----------------------------------------------------------------------------

# Student Semester Schedule
@router.get("/schedule/student/semester/", response_model=ScheduleModel)
def student_schedule_semester_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT":
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getSemesterStudentSchedule(engine=engine, student_id=current_user.role_id)


# ----------------------------------------------------------------------------
# Combined Teacher and Student Schedule
# ----------------------------------------------------------------------------

# Combined Schedule for today
@router.get("/schedule/day/", response_model=ScheduleModel)
def combined_schedule_day_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getDayTeacherSchedule(engine=engine, teacher_id=current_user.role_id)
    if current_user.role.upper() == "STUDENT":
        return getDayStudentSchedule(engine=engine, student_id=current_user.role_id)
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")


# Combined Schedule for a specific day
@router.get("/schedule/day/{date}", response_model=ScheduleModel)
def combined_schedule_day_get(
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getDayTeacherSchedule(engine=engine, teacher_id=current_user.role_id, date=convert_str_to_datetime(date))
    if current_user.role.upper() == "STUDENT":
        return getDayStudentSchedule(engine=engine, student_id=current_user.role_id, date=convert_str_to_datetime(date))
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")


# Combined Schedule for this week
@router.get("/schedule/week/", response_model=ScheduleModel)
def combined_schedule_week_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getWeekTeacherSchedule(engine=engine, teacher_id=current_user.role_id)
    if current_user.role.upper() == "STUDENT":
        return getWeekStudentSchedule(engine=engine, student_id=current_user.role_id)
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")


# Combined Schedule for a specific week
@router.get("/schedule/week/{date}", response_model=ScheduleModel)
def combined_schedule_week_get(
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getWeekTeacherSchedule(engine=engine, teacher_id=current_user.role_id, date=convert_str_to_datetime(date))
    if current_user.role.upper() == "STUDENT":
        return getWeekStudentSchedule(engine=engine, student_id=current_user.role_id, date=convert_str_to_datetime(date))
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")


# Combined Schedule for this month
@router.get("/schedule/month/", response_model=ScheduleModel)
def combined_schedule_month_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getMonthTeacherSchedule(engine=engine, teacher_id=current_user.role_id)
    if current_user.role.upper() == "STUDENT":
        return getMonthStudentSchedule(engine=engine, student_id=current_user.role_id)
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")


# Combined Schedule for a specific month
@router.get("/schedule/month/{date}", response_model=ScheduleModel)
def combined_schedule_month_get(
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() == "TEACHER":
        return getMonthTeacherSchedule(engine=engine, teacher_id=current_user.role_id, date=convert_str_to_datetime(date))
    if current_user.role.upper() == "STUDENT":
        return getMonthStudentSchedule(engine=engine, student_id=current_user.role_id, date=convert_str_to_datetime(date))
    raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")