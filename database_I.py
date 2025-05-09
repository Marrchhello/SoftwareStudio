# Change log V1 -> V2: import enum, datetime, bcrypt, pytz

import enum
import sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from typing import Optional
import bcrypt
import datetime
import pytz

########################################################################################################################
# CREATE TABLES
########################################################################################################################

Base = declarative_base()

# Change log V1 -> V2: remove year (simple calc from semester), remove teacherId (in CourseTeacher), remove old style comments, add docstring, update __repr__ for changes
class CourseCatalog(Base):
    """CourseCatalog table for postgres.
    
    courseId: int primary
    courseName: str 
    semester: def(1) int (what semester does this course appear in)
    ects: def(1) int
    """

    __tablename__ = 'CourseCatalog'
    courseId: Mapped[int] = mapped_column(primary_key=True)
    courseName: Mapped[str]
    semester: Mapped[int] = mapped_column(insert_default=1)
    ects: Mapped[int] = mapped_column(insert_default=1)

    def __repr__(self):
        return f"Course ID: {self.courseId}, Course Name: {self.courseName}, Semester: {self.semester}, ECTS: {self.ects}"


# Change log V1 -> V2: add table ClassDateTime to handle the dates and times for each course.
class ClassDateTime(Base):
    """ClassDateTime table for postgres.
    
    classDateTimeId: int primary
    courseId: int
    dateStartTime: datetime.datetime (stores both the date and the start time. unfortunately, sqlalchemy doesnt like datetime.date, can also store timezone (pytz))
    endTime: datetime.time (end time for the class)
    """
    
    __tablename__ = "ClassDateTime"
    classDateTimeId: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    dateStartTime: Mapped[datetime.datetime]
    endTime: Mapped[datetime.time]
    
    def __repr__(self):
        return f"Class Date Time ID: {self.classDateTimeId}, Course ID: {self.courseId}, Date and Start Time: {self.dateStartTime}, End Time: {self.endTime}"
    

# Change log V1 -> V2: add docstring, remove year (simple calc from semester), update __repr__
# Change log V2 -> V3: add foreign keys
class Student(Base):
    """Student table for postgres.
    
    studentId: int primary
    semester: def(1) int (which semester is the student in)
    degreeId: def(0) int (Degree the student is trying to earn)
    age: opt int
    email: opt str
    """
    
    __tablename__ = 'Student'
    studentId: Mapped[int] = mapped_column(primary_key=True)
    semester: Mapped[int] = mapped_column(insert_default=1)
    degreeId: Mapped[int] = mapped_column(ForeignKey('Degree.degreeId'), insert_default=0)
    age: Mapped[Optional[int]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"Student ID: {self.studentId}, Semester: {self.semester}, Degree ID: {self.degreeId}, Age: {self.age}, Email: {self.email}"


# Change log V1 -> V2: add docstring, update __repr__
class Teacher(Base):
    """Teacher table for postgres.
    
    teacherId: int primary
    name: opt str (Teacher name)
    title: opt str (Teacher's title)
    email: opt str (Teacher's email)
    """
    
    __tablename__ = 'Teacher'
    teacherId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    title: Mapped[Optional[str]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"Teacher ID: {self.teacherId}, Name: {self.name}, Title: {self.title}, Email: {self.email}"


# Change log V1 -> V2: add numSemesters, add docstring, update __repr__
class Degree(Base):
    """Degree table for postgres.
    
    degreeId: int primary
    name: opt str
    numSemesters: def(7) int (how many semesters are there for this degree)
    """
    
    __tablename__ = 'Degree'
    degreeId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    numSemesters: Mapped[int] = mapped_column(default=7)

    def __repr__(self):
        return f"Degree ID: {self.degreeId}, Name: {self.name}, Number of Semesters: {self.numSemesters}"


# Change log V1 -> V2: add docstring, rename id to roomId (clear confusion), make building optional, make room number optional, add dates array, add start_time, add end_time, update __repr__
# Change log V2b: remove time from room and add it to seperate table linking to course.
# Change log V2b -> V3: add foreign keys
class Room(Base):
    """Room table for postgres.
    
    roomId: int primary
    courseId: int (course the room is for)
    building: opt str 
    roomNumber: opt int 
    """
    
    __tablename__ = 'Room'
    roomId: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    building: Mapped[Optional[str]]
    roomNumber: Mapped[Optional[int]]

    def __repr__(self):
        return f"Room ID: {self.roomId}, Course ID: {self.courseId}, Building: {self.building}, Room Number: {self.roomNumber}"


# Change log V1 -> V2: make teacherId optional (teacher unassigned), rename id to courseTeacherId, add docstring, update __repr__
# Change log V2 -> V3: add foreign keys
class CourseTeacher(Base):
    """CourseTeacher table for postgres.
    
    courseTeacherId: int primary
    courseId: int (course the teacher is in)
    teacherId: opt int (Teacher assigned to the course)
    """
    
    __tablename__ = 'CourseTeacher'
    courseTeacherId: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    teacherId: Mapped[Optional[int]] = mapped_column(ForeignKey('Teacher.teacherId'))

    def __repr__(self):
        return f"Course-Teacher ID: {self.courseTeacherId}, Course ID: {self.courseId}, Teacher ID: {self.teacherId}"


# Change log V1 -> V2: add docstring, rename key to courseStudentId, add optional group field (group number student belongs to), update __repr__
# Change log V2 -> V3: add foreign keys
class CourseStudent(Base):
    """CourseStudent table for postgres.
    
    courseStudentId: int primary
    courseId: int (course the student is in)
    studentId: int (Student)
    group: opt int (group the student is in for this course)
    """
    
    __tablename__ = 'CourseStudent'
    courseStudentId: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    studentId: Mapped[int] = mapped_column(ForeignKey('Student.studentId'))
    group: Mapped[Optional[int]]

    def __repr__(self):
        return f"Course-Student ID: {self.courseStudentId}, Course ID: {self.courseId}, Student ID: {self.studentId}, Group Number: {self.group}"


# Change log V1 -> V2: create assignment table, fields, and __repr__ 
# Change log V2 -> V3: add foreign keys
class Assignment(Base):
    """Assignment table for postgres.
        
    assignmentId: int primary
    name: str
    dueDateTime: opt datetime.datetime (create object datetime.datetime, set year/month/day/hour/minute/second/timezone)
    needsSubmission: def(False) bool
    assignmentIntro: opt str (describes the assignment)
    validFileTypes: opt str (format: "pdf,jpg,jpeg,png,txt")
    group: opt int (show to only specific groups)
    courseId: int (course the assignment belongs to)
    """
    
    __tablename__ = "Assignment"
    assignmentId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    dueDateTime: Mapped[Optional[datetime.datetime]]
    needsSubmission: Mapped[bool] = mapped_column(default=False)
    assignmentIntro: Mapped[Optional[str]]
    validFileTypes: Mapped[Optional[str]]
    group: Mapped[Optional[int]]
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    
    def __repr__(self):
        return f"Assignment ID: {self.assignmentId}, Name: {self.name}, Due Date and Time: {self.dueDateTime}, Needs Submission: {self.needsSubmission}, Assignment Intro: {self.assignmentIntro}, Valid File Types: {self.validFileTypes}, Group Number: {self.group}, Course ID: {self.courseId}"

# Change log V1 -> V2: Create grades table, fields, and __repr__
# Change log V2 -> V3: add foreign keys
# Change log V3b: make assignmentId required
class Grade(Base):
    """Grade table for postgres.
    
    gradeId: int primary
    studentId: int (points to Student)
    grade: opt float
    assignmentId: int (points to Assignment)
    """
    
    __tablename__ = 'Grade'
    gradeId: Mapped[int] = mapped_column(primary_key=True)
    studentId: Mapped[int] = mapped_column(ForeignKey('Student.studentId'))
    grade: Mapped[Optional[float]]
    assignmentId: Mapped[int] = mapped_column(ForeignKey('Assignment.assignmentId'))

    def __repr__(self):
        return f"Grade ID: {self.gradeId}, Student ID: {self.studentId}, Grade: {self.grade}, Assignment ID: {self.assignmentId}"
    
    
class Staff(Base):
    """Staff table for postgres.
    
    staffId: int primary
    name: str
    email: opt str
    administrator: def(False) bool
    """
    
    __tablename__ = 'Staff'
    staffId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    email: Mapped[Optional[str]]
    administrator: Mapped[bool] = mapped_column(default=False)


# Change log V1 -> V2: create Roles enum 
class Roles(enum.Enum):
    """Roles: STUDENT, TEACHER, STAFF"""
    
    STUDENT = 'student'
    TEACHER = 'teacher'
    STAFF = 'staff'


# Change log V1 -> V2: Create user table, fields, verify password function, __repr__. 
# Change log V2 -> V3: add roleId column.
class User(Base):
    """User table for postgres.
    
    userId: int
    username: str
    password: bytes
    role: enum(Roles) : STUDENT/TEACHER/STAFF
    roleId: int (studentId/teacherId/staffId)
    
    verify_password(self, pass_bytes) -> bool
    """
    
    __tablename__ = 'User'
    userId: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(16), nullable=False)
    password: Mapped[bytes] = mapped_column(nullable=False)
    role: Mapped[Enum[Roles]] = mapped_column(Enum(Roles), nullable=False)
    roleId: Mapped[int] = mapped_column(nullable=False)

    def verify_password(self, pass_bytes):
        """Verify user password.
        
        Param:
        pass_bytes
        Requires password passed in as bytes. {password}.encode()
        
        Returns: 
        boolean True / False
        """
        return bcrypt.checkpw(pass_bytes, self.password)

    def __repr__(self):
        return f"User ID: {self.userId}, Username: {self.username}, Hashed Password: {self.password}, Role: {self.role}, Role ID: {self.roleId}"
