# University Management System

A comprehensive web-based application merging USOS and UPEL for AGH students and staff.

## Features

- Automatic class grade calculation with weighted categories
- Courses divided by semester
- Token registration improvements
- Per-group course file and grade visibility
- MyUSOSweb and student section consolidation
- Auto-create UPEL equivalent class with teacher assignment
- Custom event scheduling integrated with class timetables

## Technology Stack

- Backend: FastAPI (Python)
- Database: PostgreSQL
- Frontend: React (TypeScript)

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/university_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Initialize the database:
```bash
alembic upgrade head
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

## Project Structure

```
├── alembic/              # Database migrations
├── app/
│   ├── api/             # API endpoints
│   ├── core/            # Core functionality
│   ├── db/              # Database models and session
│   ├── schemas/         # Pydantic models
│   └── services/        # Business logic
├── tests/               # Test files
├── .env                 # Environment variables
├── alembic.ini          # Alembic configuration
├── requirements.txt     # Project dependencies
└── README.md           # This file
```

## API Documentation

Once the application is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 