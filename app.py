from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from database import DatabaseManager
from backend.database.models import Student, Teacher
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
