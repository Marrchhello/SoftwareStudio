from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.courses import router as courses_router
from routes.grades import router as grades_router
from routes.schedule import router as schedule_router
from routes.events import router as events_router
from routes.chats import router as chats_router
from routes.assignments import router as assignments_router
from routes.misc import router as misc_router

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

# Home endpoint
@app.get("/", tags=["root"])
def home():
    return {"message": "Welcome to the Software Studio API"}

# Include routers
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(grades_router)
app.include_router(schedule_router)
app.include_router(events_router)
app.include_router(chats_router)
app.include_router(assignments_router)
app.include_router(misc_router)