from Database import *
from InsertDeleteManager import DatabaseManager
from Models import *
from Query import *
from Util import convert_str_to_datetime
from fastapi import FastAPI, Request, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine
import uvicorn

# Initialize FastAPI
app = FastAPI()


origins = [
    "http://localhost:5173",
    "localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Setup templates directory
templates = Jinja2Templates(directory="templates")


# Database connection
engine = create_engine("postgresql+psycopg://postgres:password@localhost/postgres", echo=True)
db = DatabaseManager(engine)


# ----------------------------------------------------------------------------
# Root Pages
# ----------------------------------------------------------------------------

# Home Page redirect from empty
@app.get("", response_class=HTMLResponse)
def student_get(request: Request):
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


# Home page
@app.get("/", tags=["root"], response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


# ----------------------------------------------------------------------------
# Login and Registration
# ----------------------------------------------------------------------------

# Registration page
@app.get("/register", response_class=HTMLResponse)
def register_get(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# Handle registration
@app.post("/register")
def register_post(
    request: Request,
    role: str = Form(...),
    user_id: int = Form(...),
    name: str = Form(None),
    title: str = Form(None),
    email: str = Form(None),
    semester: int = Form(1),
    year: int = Form(1),
):
    if role == Roles.STUDENT:
        db.register_user(role, user_id, email=email, semester=semester, year=year)
    elif role == Roles.TEACHER:
        db.register_user(role, user_id, name=name, title=title, email=email)
    return RedirectResponse("/", status_code=303)


# Login page
@app.get("/login", response_class=HTMLResponse)
def login_get(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


# Handle login
@app.post("/login")
def login_post(request: Request, user_id: int = Form(...)):
    role, user = db.login_user(user_id)
    if role:
        return templates.TemplateResponse("home.html", {"request": request, "role": role, "user": user})
    return templates.TemplateResponse("login.html", {"request": request, "error": "User not found."})


# ----------------------------------------------------------------------------
# Student Redirect and Courses
# ----------------------------------------------------------------------------

# Student page (redirects to /login)
@app.get("/student", response_class=HTMLResponse)
def student_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# GET All Student Courses
@app.get("/student/{student_id}/courses", response_model=StudentCourseListModel)
def student_courses_get(request: Request, student_id: int):
    return getStudentCourses(engine=engine, student_id=student_id)


# ----------------------------------------------------------------------------
# Course Schedule
# ----------------------------------------------------------------------------


# Student specific course schedule
@app.get("/student/{student_id}/courses/{course_id}/schedule", response_model=ClassScheduleModel)
def student_course_schedule_get(request: Request, student_id: int, course_id: int):
    return getCourseSchedule(engine=engine, course_id=course_id)


# Teacher specific course schedule
@app.get("/teacher/{teacher_id}/courses/{course_id}/schedule", response_model=ClassScheduleModel)
def teacher_course_schedule_get(request: Request, teacher_id: int, course_id: int):
    return getCourseSchedule(engine=engine, course_id=course_id)


# ----------------------------------------------------------------------------
# Student Grades
# ----------------------------------------------------------------------------

# GET Student Grades for Specific Course
@app.get("/student/{student_id}/courses/{course_id}/grades", response_model=GradeListModel)
def student_course_grades_get(request: Request, student_id: int, course_id: int):
    return getStudentGradesForCourse(engine=engine, student_id=student_id, course_id=course_id)


# GET All Student Grades
@app.get("/student/{student_id}/grades", response_model=GradeListModel)
def student_grades_get(request: Request, student_id: int):
    return getStudentGrades(engine=engine, student_id=student_id)


# ----------------------------------------------------------------------------
# Student Schedule
# ----------------------------------------------------------------------------

# Student Schedule for today
@app.get("/student/{student_id}/schedule/day/", response_model=ScheduleModel)
def student_schedule_day_get(request: Request, student_id: int):
    return getDayStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific day
@app.get("/student/{student_id}/schedule/day/{date}", response_model=ScheduleModel)
def student_schedule_day_get(request: Request, student_id: int, date: str):
    return getDayStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Schedule for this week
@app.get("/student/{student_id}/schedule/week/", response_model=ScheduleModel)
def student_schedule_week_get(request: Request, student_id: int):
    return getWeekStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific week
@app.get("/student/{student_id}/schedule/week/{date}", response_model=ScheduleModel)
def student_schedule_week_get(request: Request, student_id: int, date: str):
    return getWeekStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Schedule for this month
@app.get("/student/{student_id}/schedule/month/", response_model=ScheduleModel)
def student_schedule_month_get(request: Request, student_id: int):
    return getMonthStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific month
@app.get("/student/{student_id}/schedule/month/{date}", response_model=ScheduleModel)
def student_schedule_month_get(request: Request, student_id: int, date: str):
    return getMonthStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Schedule for semester
@app.get("/student/{student_id}/schedule/semester", response_model=ScheduleModel)
def student_schedule_month_get(request: Request, student_id: int):
    return getSemesterStudentSchedule(engine=engine, student_id=student_id)


# ----------------------------------------------------------------------------
# Teacher Redirect and Courses
# ----------------------------------------------------------------------------

# Teacher page (redirects to /login)
@app.get("/teacher", response_class=HTMLResponse)
def teacher_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# GET All Teacher Courses 
@app.get("/teacher/{teacher_id}/courses", response_model=TeacherCourseListModel)
def teacher_courses_get(request: Request, teacher_id: int):
    return getTeacherCourses(engine=engine, teacher_id=teacher_id)


# ----------------------------------------------------------------------------
# Teacher Schedule
# ----------------------------------------------------------------------------

# Teacher Schedule for today
@app.get("/teacher/{teacher_id}/schedule/day/", response_model=ScheduleModel)
def teacher_schedule_day_get(request: Request, teacher_id: int):
    return getDayTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific day
@app.get("/teacher/{teacher_id}/schedule/day/{date}", response_model=ScheduleModel)
def teacher_schedule_day_get(request: Request, teacher_id: int, date: str):
    return getDayTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# Teacher Schedule for this week
@app.get("/teacher/{teacher_id}/schedule/week/", response_model=ScheduleModel)
def teacher_schedule_week_get(request: Request, teacher_id: int):
    return getWeekTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific week
@app.get("/teacher/{teacher_id}/schedule/week/{date}", response_model=ScheduleModel)
def teacher_schedule_week_get(request: Request, teacher_id: int, date: str):
    return getWeekTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# Teacher Schedule for this month
@app.get("/teacher/{teacher_id}/schedule/month/", response_model=ScheduleModel)
def teacher_schedule_month_get(request: Request, teacher_id: int):
    return getMonthTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific month
@app.get("/teacher/{teacher_id}/schedule/month/{date}", response_model=ScheduleModel)
def teacher_schedule_month_get(request: Request, teacher_id: int, date: str):
    return getMonthTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# ----------------------------------------------------------------------------
# Staff
# ----------------------------------------------------------------------------

# Staff page (redirects to /login)
@app.get("/staff", response_class=HTMLResponse)
def staff_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# ----------------------------------------------------------------------------
# Other Pages
# ----------------------------------------------------------------------------

# Get FAQ Questions 
@app.get("/faq", response_model=FAQListModel)
def faq_get(request: Request):
    return getFAQ(engine)


# ----------------------------------------------------------------------------
# Main Method
# ----------------------------------------------------------------------------

# Run the backend
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)