# SoftwareStudio – Documentation

## Overview

SoftwareStudio is a university project providing a modern educational platform for managing courses, assignments, grades, schedules, and communication between students and teachers. It consists of a FastAPI backend and a React (Vite) frontend, with Docker support for deployment.

---

## Project Structure

```
SoftwareStudio/
  backend/         # FastAPI backend
    routes/        # API route modules
    Models.py      # Pydantic models for API
    Database.py    # SQLAlchemy models and DB logic
    ...
  frontend/        # React frontend (Vite)
    src/
      components/  # React components
      api.js       # API calls to backend
      ...
  docker-compose.yml
  README.md
```

---

## Backend

### Overview

- **Framework:** FastAPI
- **Authentication:** JWT-based, role-based access control (Student, Teacher, Staff)
- **Database:** SQLAlchemy ORM (PostgreSQL)
- **Key Features:** User registration/login, course management, assignments, grades, schedules, chat, events, FAQ

### Main Entry Point

- `backend/app.py`: Initializes FastAPI app, sets up CORS, and includes all route modules.

### Authentication Flow

1. **Register**: `/register` endpoint (role, role_id, email, etc.)
2. **Login**: `/token` endpoint (returns JWT)
3. **Protected Endpoints**: Require JWT in `Authorization: Bearer <token>`

### API Endpoints
-    Backend docks: http://localhost:8000/docs

#### Public Endpoints

- `/` – Home
- `/register` – Registration info and POST
- `/login` – Login info and POST
- `/token` – Obtain JWT
- `/faq` – Get FAQ

#### Protected Endpoints (JWT required)

- **User Data**: `/me`, `/role`, `/role_id`, `/name`, `/profile`
- **Courses**: `/student/courses`, `/teacher/courses`, `/course/{id}/students`, `/course/{id}/schedule`
- **Assignments**: `/assignment/`, `/student/{id}/courses/{id}/assignments/{id}/submission`
- **Grades**: `/student/grades`, `/student/courses/{id}/grades`, `/grade/`
- **Schedule**: `/schedule/student/semester/`, `/schedule/week/`, `/schedule/month/`
- **Events**: `/events/`
- **Chats**: `/chats/`, `/chats/{id}/messages`


#### Route Modules

- `routes/auth.py`: Registration, login, token, user info
- `routes/courses.py`: Student/teacher courses, course students, course schedule
- `routes/assignments.py`: Assignment creation/submission
- `routes/grades.py`: Student grades, grade posting
- `routes/schedule.py`: Student/teacher schedules (semester, week, month)
- `routes/events.py`: University events
- `routes/chats.py`: Chat and messaging
- `routes/misc.py`: FAQ
- `routes/user_data.py`: User profile, role, name

#### Models

- `Models.py`: Pydantic models for request/response validation (e.g., User, Assignment, Grade, Schedule, Chat, FAQ)
- `Database.py`: SQLAlchemy models for DB tables

#### Security

- Passwords hashed with bcrypt
- JWT tokens signed and expire after 30 minutes
- Role-based access for endpoints

---

## Frontend

### Overview

- **Framework:** React (Vite)
- **Routing:** React Router
- **State Management:** React Context (for dark mode)
- **API Calls:** `src/api.js` (fetches from backend)
- **Styling:** CSS modules

### Main Entry Point

- `src/App.jsx`: Sets up routes for all main pages/components.

### Main Pages & Components

- **UpsosHomepage**: Landing page, platform features, login/register links
- **LoginPage**: User login, stores JWT and role in localStorage
- **RegisterPage**: User registration, password validation
- **StudentView**: Student dashboard (courses, grades, schedule, events, chat)
- **ProfView**: Teacher dashboard (courses, schedule, events, chat, manage assignments/grades)
- **FAQPage**: Frequently asked questions
- **MapPage**: Campus map
- **AssignmentSubmissions**: View and manage assignment submissions
- **ProfileView**: User profile (name, email, role, etc.)
- **Courses**: Course details, students, assignments, schedule (teacher view)
- **Materials**: Course materials and assignment submission (student view)
- **GradesStudent**: Student grades for a course

### Data Flow

- On login/register, JWT is stored in localStorage.
- All API requests include JWT in the Authorization header.
- User role and ID are fetched and used to determine available views/routes.
- Components fetch data from backend endpoints and render accordingly.

---

## Setup & Deployment

### Prerequisites

- Docker & Docker Compose (recommended)
- Node.js (for frontend dev)
- Python 3.9+ (for backend dev)
- PostgreSQL (if not using Docker)

### Running with Docker

1. Build and start all services:
   ```sh
   docker-compose up -d --build
   ```
2. Frontend: http://localhost:5173  
   Backend: http://localhost:8000


### Running Locally (Dev)

**Backend:**
```sh
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

**Frontend:**
```sh
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## Additional Notes

- **Database Schema:** See `init.sql` for initial schema.
- **Environment Variables:** Configure DB connection in backend as needed.
- **Extending:** Add new routes/components as needed for new features.
