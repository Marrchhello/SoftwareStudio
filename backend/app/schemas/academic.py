from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Course schemas
class CourseBase(BaseModel):
    name: str
    ects: int
    semester: int
    room_number: str
    teacher_id: int

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True

# Degree schemas
class DegreeBase(BaseModel):
    name: str

class DegreeCreate(DegreeBase):
    pass

class Degree(DegreeBase):
    id: int

    class Config:
        from_attributes = True

# Enrollment schemas
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    group_number: int

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    class Config:
        from_attributes = True

# Assignment schemas
class AssignmentBase(BaseModel):
    course_id: int
    due_date: datetime
    type: str
    description: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Grade schemas
class GradeBase(BaseModel):
    student_id: int
    assignment_id: int
    grade: float

class GradeCreate(GradeBase):
    pass

class Grade(GradeBase):
    id: int
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Attendance schemas
class AttendanceBase(BaseModel):
    student_id: int
    course_id: int
    classes_missed: int

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    last_updated: datetime

    class Config:
        from_attributes = True 