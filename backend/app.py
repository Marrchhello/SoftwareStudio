from Database import *
from InsertDeleteManager import DatabaseManager
from Models import *
from Query import *
from Util import convert_str_to_datetime
from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uvicorn
from auth import (
    Token, 
    authenticate_user, 
    create_access_token, 
    get_current_active_user, 
    get_user_with_role,
    UserAuth,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta
from typing import Annotated, Dict
import os
from user_managment import create_user
from sqlalchemy.orm import Session

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

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/postgres")
engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

db = DatabaseManager(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication endpoint
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["user_id"], 
            "role": user["role"],
            "role_id": user["role_id"]
        }, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Home endpoint
@app.get("/", tags=["root"])
def home():
    return {"message": "Welcome to the Software Studio API"}

# Get registration info
@app.get("/register")
async def register_info():
    return {
        "message": "Registration endpoint information",
        "method": "POST",
        "required_fields": {
            "role": "string (STUDENT or TEACHER)",
            "user_id": "integer",
            "email": "string"
        },
        "optional_fields": {
            "name": "string (required for TEACHER)",
            "title": "string (required for TEACHER)",
            "semester": "integer (1-8, default: 1, for STUDENT only)",
            "year": "integer (1-4, default: 1, for STUDENT only)"
        }
    }

@app.post("/register")
async def register(
    role: str,
    user_id: int,
    email: str,
    username: str,
    password: str,
    name: str = None,
    title: str = None,
    semester: int = 1,
    degreeId: int = 1,      # Default to Computer Science
    age: int = None,        
):
    try:
        role = role.lower()
        if role not in ['student', 'teacher']:
            raise ValueError("Role must be either 'student' or 'teacher'")

        # Check if user already exists
        with Session(engine) as session:
            existing_user = session.query(User).filter(User.userId == user_id).first()
            if existing_user:
                raise ValueError(f"User with ID {user_id} already exists")

            if role == 'student':
                existing_student = session.query(Student).filter(Student.studentId == user_id).first()
                if existing_student:
                    raise ValueError(f"Student with ID {user_id} already exists")
            elif role == 'teacher':
                existing_teacher = session.query(Teacher).filter(Teacher.teacherId == user_id).first()
                if existing_teacher:
                    raise ValueError(f"Teacher with ID {user_id} already exists")

        # First create the role-specific record
        if role == 'student':
            # Check if degree exists, if not create default degrees
            with Session(engine) as session:
                degree = session.query(Degree).filter(Degree.degreeId == degreeId).first()
                if not degree:
                    # Create default degrees
                    degrees = [
                        Degree(degreeId=1, name='Computer Science', numSemesters=8),
                        Degree(degreeId=2, name='Software Engineering', numSemesters=7),
                        Degree(degreeId=3, name='Data Science', numSemesters=8)
                    ]
                    session.add_all(degrees)
                    session.commit()

            try:
                # Add student record
                db.add_student(
                    student_id=user_id,
                    semester=semester,
                    degree_id=degreeId,
                    age=age,
                    email=email
                )
            except Exception as e:
                raise ValueError(f"Failed to create student record: {str(e)}")

        elif role == 'teacher':
            try:
                # Add teacher record
                db.add_teacher(
                    teacher_id=user_id,
                    name=name,
                    title=title,
                    email=email
                )
            except Exception as e:
                raise ValueError(f"Failed to create teacher record: {str(e)}")

        # Then create the user account
        if not create_user(engine, user_id, user_id, username, password, Roles(role)):
            # If user creation fails, we should clean up the role-specific record
            if role == 'student':
                db.delete_student(user_id)
            elif role == 'teacher':
                db.delete_teacher(user_id)
            raise ValueError("Failed to create user account")
            
        return {"message": "Registration successful", "user_id": user_id, "role": role}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Get login info
@app.get("/login")
async def login_info():
    return {
        "message": "Login endpoint information",
        "method": "POST",
        "required_fields": {
            "user_id": "integer"
        },
        "note": "For token-based authentication, use /token endpoint with username and password"
    }

# Login endpoint
@app.post("/login")
async def login(user_id: int):
    role, user = db.login_user(user_id)
    if role:
        return {"role": role, "user": user}
    raise HTTPException(status_code=404, detail="User not found")

# User profile endpoint
@app.get("/me", response_model=UserAuth)
async def read_users_me(current_user: Annotated[UserAuth, Depends(get_current_active_user)]):
    print(f"DEBUG: /me endpoint accessed")
    print(f"DEBUG: Current user data: {current_user}")
    try:
        return current_user
    except Exception as e:
        print(f"DEBUG: Error in /me endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET All Student Courses
@app.get("/student/{student_id}/courses", response_model=StudentCourseListModel)
def student_courses_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentCourses(engine=engine, student_id=student_id)

# GET Student Grades for Specific Course
@app.get("/student/{student_id}/courses/{course_id}/grades", response_model=GradeListModel)
def student_course_grades_get(
    student_id: int, 
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGradesForCourse(engine=engine, student_id=student_id, course_id=course_id)

# GET All Student Grades
@app.get("/student/{student_id}/grades", response_model=GradeListModel)
def student_grades_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGrades(engine=engine, student_id=student_id)

# GET Teacher Courses
@app.get("/teacher/{teacher_id}/courses", response_model=TeacherCourseListModel)
def teacher_courses_get(
    teacher_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.user_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getTeacherCourses(engine=engine, teacher_id=teacher_id)

# Student Schedule for today
@app.get("/student/{student_id}/schedule/day/", response_model=ScheduleModel)
def student_schedule_day_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getDayStudentSchedule(engine=engine, student_id=student_id)

# Student Schedule for a specific day
@app.get("/student/{student_id}/schedule/day/{date}", response_model=ScheduleModel)
def student_schedule_day_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getDayStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))

# Student Schedule for this week
@app.get("/student/{student_id}/schedule/week/", response_model=ScheduleModel)
def student_schedule_week_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getWeekStudentSchedule(engine=engine, student_id=student_id)

# Student Schedule for a specific week
@app.get("/student/{student_id}/schedule/week/{date}", response_model=ScheduleModel)
def student_schedule_week_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getWeekStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))

# Student Schedule for this month
@app.get("/student/{student_id}/schedule/month/", response_model=ScheduleModel)
def student_schedule_month_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getMonthStudentSchedule(engine=engine, student_id=student_id)

# Student Schedule for a specific month
@app.get("/student/{student_id}/schedule/month/{date}", response_model=ScheduleModel)
def student_schedule_month_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getMonthStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))

# Run the backend
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)