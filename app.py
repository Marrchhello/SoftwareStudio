from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from database import DatabaseManager
from models import Student, Teacher
from sqlalchemy import create_engine

# Initialize FastAPI
app = FastAPI()

#Setup
# Setup templates directory
templates = Jinja2Templates(directory="templates")

# Database connection
engine = create_engine("sqlite:///university.db", echo=True)
db = DatabaseManager(engine)


# Home page
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


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
    if role == 'student':
        db.register_user(role, user_id, email=email, semester=semester, year=year)
    elif role == 'teacher':
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


# Student page (redirects to /login)
@app.get("/student", response_class=HTMLResponse)
def student_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# Student page after login TBF
@app.get("/student/{student_id}", response_class=HTMLResponse)
def student_main_get(request: Request, student_id: int):
    return None


# Student courses page TBF
@app.get("/student/{student_id}/courses", response_class=HTMLResponse)
def student_courses_get(request: Request, student_id: int):
    return None


# Student specific course main page TBF
@app.get("/student/{student_id}/courses/{course_id}", response_class=HTMLResponse)
def student_course_main_get(request: Request, student_id: int, course_id: int):
    return None


# Student specific course schedule TBF
@app.get("/student/{student_id}/courses/{course_id}/schedule", response_class=HTMLResponse)
def student_course_schedule_get(request: Request, student_id: int, course_id: int):
    return None


# Student specific course grades TBF
@app.get("/student/{student_id}/courses/{course_id}/grades", response_class=HTMLResponse)
def student_course_grades_get(request: Request, student_id: int, course_id: int):
    return None


# Student overall grades page TBF
@app.get("/student/{student_id}/grades", response_class=HTMLResponse)
def student_grades_get(request: Request, student_id: int):
    return None


# Student schedule page TBF
@app.get("/student/{student_id}/schedule", response_class=HTMLResponse)
def student_schedule_get(request: Request, student_id: int):
    return None


# Teacher page (redirects to /login)
@app.get("/teacher", response_class=HTMLResponse)
def teacher_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# Teacher page after login TBF
@app.get("/teacher/{teacher_id}", response_class=HTMLResponse)
def teacher_main_get(request: Request, teacher_id: int):
    return None


# Teacher courses page TBF
@app.get("/teacher/{teacher_id}/courses", response_class=HTMLResponse)
def student_courses_get(request: Request, teacher_id: int):
    return None


# Teacher specific course main page TBF
@app.get("/teacher/{teacher_id}/courses/{course_id}", response_class=HTMLResponse)
def student_course_main_get(request: Request, teacher_id: int, course_id: int):
    return None


# Teacher specific course schedule TBF
@app.get("/teacher/{teacher_id}/courses/{course_id}/schedule", response_class=HTMLResponse)
def student_course_schedule_get(request: Request, teacher_id: int, course_id: int):
    return None


# Staff page (redirects to /login)
@app.get("/staff", response_class=HTMLResponse)
def staff_get(request: Request):
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


# Staff page after login TBF
@app.get("/staff/{staff_id}", response_class=HTMLResponse)
def staff_main_get(request: Request, staff_id: int):
    return None


# FAQ Page TBF
@app.get("/faq", response_class=HTMLResponse)
def faq_get(request: Request):
    return None


# Map Page TBF
@app.get("/map", response_class=HTMLResponse)
def map_get(request: Request):
    return None