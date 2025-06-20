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
from sqlalchemy import and_

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
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost:4243/postgres")
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

# ----------------------------------------------------------------------------
# Login, Registration, and Authentication
# ----------------------------------------------------------------------------

# Authentication endpoint
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print(f"\nDEBUG: Token request received for username: {form_data.username}")
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        print("DEBUG: Authentication failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG: User authenticated successfully: {user}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Ensure consistent types in token data
    token_data = {
        "sub": str(user["user_id"]),  # Store as string in token
        "role": str(user["role"]),
        "role_id": int(user["role_id"])
    }
    
    print(f"DEBUG: Creating token with data: {token_data}")
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    
    print(f"DEBUG: Token created successfully")
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
    
# Register V2
@app.post("/register")
async def register(
    role: str,
    role_id: int,
    username: str,
    password: str
):
    res, err = create_user(engine=engine, roleId=role_id, username=username, password=password, role=Roles(role.lower()))
    if not res:
        raise HTTPException(status_code=400, detail=err)
    return {"message": err}

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
async def read_users_me(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    print(f"\nDEBUG: /me endpoint accessed")
    print(f"DEBUG: Current user data: {current_user}")
    try:
        # Ensure types are correct
        return UserAuth(
            user_id=int(current_user.user_id),
            role=str(current_user.role),
            role_id=int(current_user.role_id)
        )
    except Exception as e:
        print(f"DEBUG: Error in /me endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    
# Get authenticated user role
@app.get("/role")
async def get_role(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"role": current_user.role}


# Get authenticated user role ID
@app.get("/role_id")
async def get_role_id(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return {"role_id": current_user.role_id} 


# Get authenticated user name
@app.get("/name")
async def get_name(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    role = current_user.role
    return {"name": getName(engine=engine, role=role, role_id=current_user.role_id)}


# Get unknown user name from user_id
@app.get("/name/{user_id}")
async def get_name(
    user_id: int
):
    return {"name": getNameFromUserId(engine=engine, user_id=user_id)}

    
# ----------------------------------------------------------------------------
# Courses
# ----------------------------------------------------------------------------

# GET All Student Courses
@app.get("/student/{student_id}/courses", response_model=StudentCourseListModel)
def student_courses_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentCourses(engine=engine, student_id=student_id)


# GET Teacher Courses
@app.get("/teacher/{teacher_id}/courses", response_model=TeacherCourseListModel)
def teacher_courses_get(
    teacher_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getTeacherCourses(engine=engine, teacher_id=teacher_id)


# GET All Students for Course
@app.get("/course/{course_id}/students", response_model=CourseStudentsListModel)
def course_students_get(
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
    
    return getCourseStudents(engine=engine, course_id=course_id)


# GET All Assignments for Course (Teacher only)
@app.get("/course/{course_id}/assignments", response_model=CourseAssignmentsListModel)
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


# GET All Assignments for Course (Student view with group filtering)
@app.get("/student/{student_id}/courses/{course_id}/assignments", response_model=CourseAssignmentsListModel)
def student_course_assignments_get(
    student_id: int,
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    
    # Check if student is enrolled in this course
    with Session(engine) as session:
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
    
    return getCourseAssignmentsForStudent(engine=engine, course_id=course_id, student_id=student_id)


# ----------------------------------------------------------------------------
# Grades
# ----------------------------------------------------------------------------

# GET Student Grades for Specific Course
@app.get("/student/{student_id}/courses/{course_id}/grades", response_model=GradeListModel)
def student_course_grades_get(
    student_id: int, 
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGradesForCourse(engine=engine, student_id=student_id, course_id=course_id)


# GET Student Grades for Specific Course (Teacher access)
@app.get("/course/{course_id}/student/{student_id}/grades", response_model=GradeListModel)
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
@app.get("/student/{student_id}/grades", response_model=GradeListModel)
def student_grades_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getStudentGrades(engine=engine, student_id=student_id)


# POST Grade (with model)
@app.post("/grade/")
def assignment_grade_model_post(
    model: GradePostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return postGrade(engine=engine, teacher_id=current_user.role_id, model=model)


# ----------------------------------------------------------------------------
# Assignments
# ----------------------------------------------------------------------------

# POST Assignment (with model)
@app.post("/assignment/")
def assignment_post(
    model: AssignmentPostModel,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER":
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    return postAssignment(engine=engine, teacher_id=current_user.role_id, model=model)


# ----------------------------------------------------------------------------
# Student Schedule
# ----------------------------------------------------------------------------

# Student Schedule for today
@app.get("/student/{student_id}/schedule/day/", response_model=ScheduleModel)
def student_schedule_day_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getDayStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific day
@app.get("/student/{student_id}/schedule/day/{date}", response_model=ScheduleModel)
def student_schedule_day_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getDayStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Schedule for this week
@app.get("/student/{student_id}/schedule/week/", response_model=ScheduleModel)
def student_schedule_week_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getWeekStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific week
@app.get("/student/{student_id}/schedule/week/{date}", response_model=ScheduleModel)
def student_schedule_week_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getWeekStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Schedule for this month
@app.get("/student/{student_id}/schedule/month/", response_model=ScheduleModel)
def student_schedule_month_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getMonthStudentSchedule(engine=engine, student_id=student_id)


# Student Schedule for a specific month
@app.get("/student/{student_id}/schedule/month/{date}", response_model=ScheduleModel)
def student_schedule_month_get(
    student_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getMonthStudentSchedule(engine=engine, student_id=student_id, date=convert_str_to_datetime(date))


# Student Semester Schedule
@app.get("/student/{student_id}/schedule/semester", response_model=ScheduleModel)
def student_schedule_semsester_get(
    student_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "STUDENT" or current_user.role_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's data")
    return getSemesterStudentSchedule(engine=engine, student_id=student_id)


# ----------------------------------------------------------------------------
# Teacher Schedule
# ----------------------------------------------------------------------------

# Teacher Schedule for today
@app.get("/teacher/{teacher_id}/schedule/day/", response_model=ScheduleModel)
def teacher_schedule_day_get(
    teacher_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getDayTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific day
@app.get("/teacher/{teacher_id}/schedule/day/{date}", response_model=ScheduleModel)
def teacher_schedule_day_get(
    teacher_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getDayTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# Teacher Schedule for this week
@app.get("/teacher/{teacher_id}/schedule/week/", response_model=ScheduleModel)
def teacher_schedule_week_get(
    teacher_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getWeekTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific week
@app.get("/teacher/{teacher_id}/schedule/week/{date}", response_model=ScheduleModel)
def teacher_schedule_week_get(
    teacher_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getWeekTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# Teacher Schedule for this month
@app.get("/teacher/{teacher_id}/schedule/month/", response_model=ScheduleModel)
def teacher_schedule_month_get(
    teacher_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getMonthTeacherSchedule(engine=engine, teacher_id=teacher_id)


# Teacher Schedule for a specific month
@app.get("/teacher/{teacher_id}/schedule/month/{date}", response_model=ScheduleModel)
def teacher_schedule_month_get(
    teacher_id: int, 
    date: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if current_user.role.upper() != "TEACHER" or current_user.role_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this teacher's data")
    return getMonthTeacherSchedule(engine=engine, teacher_id=teacher_id, date=convert_str_to_datetime(date))


# ----------------------------------------------------------------------------
# University Events
# ----------------------------------------------------------------------------

# Get University Events for today
@app.get("/events/", response_model=UniEventScheduleModel)
def university_events_get():
    return getUniversityEvents(engine=engine)


# Get University Events for a specific date
@app.get("/events/{date}", response_model=UniEventScheduleModel)
def university_events_get(date: str):
    return getUniversityEvents(engine=engine, start_date=convert_str_to_datetime(date))


# ----------------------------------------------------------------------------
# FAQ
# ----------------------------------------------------------------------------

# Get FAQ
@app.get("/faq/", response_model=FAQListModel)
def faq_get():
    return getFAQ(engine=engine)


# ----------------------------------------------------------------------------
# Chat
# ----------------------------------------------------------------------------

# Get Chats
@app.get("/chats/", response_model=ChatListModel)
def chat_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    user_id = getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role)
    return getChats(engine=engine, user_id=user_id)


# Get Chat Messages
@app.get("/chats/{chat_id}/messages/", response_model=ChatMessageListModel)
def chat_messages_get(
    chat_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if not TestUserChat(engine=engine, user_id=getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role), chat_id=chat_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    chat_messages = getChatMessages(engine=engine, chat_id=chat_id)
    if chat_messages.ChatMessageList:
        return chat_messages
    raise HTTPException(status_code=404, detail="No messages found for this chat")


# Post Chat Message
@app.post("/chats/{chat_id}/messages/")
def chat_message_post(
    chat_id: int,
    message: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    if not TestUserChat(engine=engine, user_id=getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role), chat_id=chat_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    return postChatMessage(engine=engine, chat_id=chat_id, sender_id=getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role), message=message)


# Create Chat (returns chat id)
@app.post("/chats/")
def chat_create(
    user2_role: str,
    user2_role_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return createChat(engine=engine, user1_id=getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role), user2_id=getUserId(engine=engine, role_id=user2_role_id, role=user2_role))

# ----------------------------------------------------------------------------
# Course Schedule View
# ----------------------------------------------------------------------------

@app.get("/course/{course_id}/schedule-view", response_model=CourseScheduleViewModel)
def get_course_schedule_view(
    course_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    """Get the schedule view for a specific course."""
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
    
    return getCourseScheduleView(engine=engine, course_id=course_id)

# ----------------------------------------------------------------------------
# Main Method
# ----------------------------------------------------------------------------

# Run the backend
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)