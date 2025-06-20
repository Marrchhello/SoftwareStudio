# Change log V1 -> V2: import enum, datetime, bcrypt, pytz

import enum
from sqlalchemy import *
from sqlalchemy.orm import *
from typing import Optional
import bcrypt
import datetime

########################################################################################################################
# CREATE TABLES
########################################################################################################################

Base = declarative_base()


# Change log V1 -> V2: create assignment table, fields, and __repr__ 
# Change log V2 -> V3: add foreign keys
# Change log V3 -> V4: make name not optional, add opt description
class Assignment(Base):
    """Assignment table for postgres.
        
    assignmentId: int primary
    name: str
    desc: opt str
    dueDateTime: opt datetime.datetime (create object datetime.datetime, set year/month/day/hour/minute/second/timezone)
    needsSubmission: def(False) bool
    validFileTypes: opt str (format: "pdf,jpg,jpeg,png,txt")
    group: opt int (show to only specific groups)
    courseId: int (course the assignment belongs to)
    """
    
    __tablename__ = "Assignment"
    assignmentId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    desc: Mapped[Optional[str]]
    dueDateTime: Mapped[Optional[datetime.datetime]]
    needsSubmission: Mapped[bool] = mapped_column(default=False)
    validFileTypes: Mapped[Optional[str]]
    group: Mapped[Optional[int]]
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    
    def __repr__(self):
        return f"Assignment ID: {self.assignmentId}, Name: {self.name}, Description: {self.desc}, Due Date and Time: {self.dueDateTime}, Needs Submission: {self.needsSubmission}, Valid File Types: {self.validFileTypes}, Group Number: {self.group}, Course ID: {self.courseId}"


# Change log V1: create assignment submission table, fields, and __repr__
class AssignmentSubmission(Base):
    """AssignmentSubmission table for postgres.
    
    assignmentSubmissionId: int primary
    assignmentId: int (assignment the submission belongs to)
    studentId: int (student who submitted the assignment)
    submissionDateTime: datetime.datetime (date and time the submission was made)
    submission: opt str (Submission in str format, or link to location.)
    """

    __tablename__ = 'AssignmentSubmission'
    assignmentSubmissionId: Mapped[int] = mapped_column(primary_key=True)
    assignmentId: Mapped[int] = mapped_column(ForeignKey('Assignment.assignmentId'))
    studentId: Mapped[int] = mapped_column(ForeignKey('Student.studentId'))
    submissionDateTime: Mapped[datetime.datetime]
    submission: Mapped[Optional[str]]
    

    def __repr__(self):
        return f"Assignment Submission ID: {self.assignmentSubmissionId}, Assignment ID: {self.assignmentId}, Student ID: {self.studentId}, Submission Date and Time: {self.submissionDateTime}, Submission: {self.submission}"


# Change log V1: create chat table
class Chat(Base):
    """Chat table for postgres.
    
    chatId: int primary
    user1Id: int (first user in the chat)
    user2Id: int (second user in the chat)
    """

    __tablename__ = 'Chat'
    chatId: Mapped[int] = mapped_column(primary_key=True)
    user1Id: Mapped[int] = mapped_column(ForeignKey('User.userId'))
    user2Id: Mapped[int] = mapped_column(ForeignKey('User.userId'))
    
    def __repr__(self):
        return f"Chat ID: {self.chatId}, User 1 ID: {self.user1Id}, User 2 ID: {self.user2Id}"
    

# Change log V1: create chat message table
class ChatMessage(Base):
    """ChatMessage table for postgres.
    
    chatMessageId: int primary
    chatId: int (chat the message belongs to)
    senderId: int (user who sent the message)
    message: str (the message)
    timestamp: datetime.datetime (timestamp of the message)
    """
    
    __tablename__ = 'ChatMessage'
    chatMessageId: Mapped[int] = mapped_column(primary_key=True)
    chatId: Mapped[int] = mapped_column(ForeignKey('Chat.chatId'))
    senderId: Mapped[int] = mapped_column(ForeignKey('User.userId'))
    message: Mapped[str]
    timestamp: Mapped[datetime.datetime]
    
    def __repr__(self):
        return f"Chat Message ID: {self.chatMessageId}, Chat ID: {self.chatId}, Sender ID: {self.senderId}, Message: {self.message}, Timestamp: {self.timestamp}"


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
    isBiWeekly: Mapped[bool] = mapped_column(default=False)

    def __repr__(self):
        return f"Course ID: {self.courseId}, Course Name: {self.courseName}, Semester: {self.semester}, ECTS: {self.ects}, Is BiWeekly: {self.isBiWeekly}"


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
    

# V1: FAQ Data
class FAQ(Base):
    """FAQ table for postgres.
    
    Args:
        faqId: int primary
        question: str
        answer: str
    """
    
    __tablename__ = 'FAQ'
    faqId: Mapped[int] = mapped_column(primary_key=True)
    question: Mapped[str]
    answer: Mapped[str]
    
    def __repr__(self):
        return f"FAQ ID: {self.faqId}, Question: {self.question}, Answer: {self.answer}"
    

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
    

# Change log V1 -> V2: create Roles enum 
class Roles(enum.Enum):
    """Roles: STUDENT, TEACHER, STAFF"""
    
    STUDENT = 'student'
    TEACHER = 'teacher'
    STAFF = 'staff'


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
    

# Change log V1 -> V2: Add repr in.    
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
    
    def __repr__(self):
        return f"Staff ID: {self.staffId}, Name: {self.name}, Email: {self.email}, Admin: {self.administrator}"
    

# Change log V1 -> V2: add docstring, remove year (simple calc from semester), update __repr__
# Change log V2 -> V3: add foreign keys
class Student(Base):
    """Student table for postgres.
    
    studentId: int primary
    semester: def(1) int (which semester is the student in)
    degreeId: def(0) int (Degree the student is trying to earn)
    name: opt str
    age: opt int
    email: opt str
    """
    
    __tablename__ = 'Student'
    studentId: Mapped[int] = mapped_column(primary_key=True)
    semester: Mapped[int] = mapped_column(insert_default=1)
    degreeId: Mapped[int] = mapped_column(ForeignKey('Degree.degreeId'), insert_default=0)
    name: Mapped[Optional[str]]
    age: Mapped[Optional[int]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"Student ID: {self.studentId}, Semester: {self.semester}, Degree ID: {self.degreeId}, Name: {self.name}, Age: {self.age}, Email: {self.email}"


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
    
    
# Change log V1: Create university wide events table. This is to make it easy to store days off and other important events.
class UniversityEvents(Base):
    """University Events table for postgres.
    
    eventId: int primary
    eventName: str 
    dateStartTime: datetime.datetime (Date and Start time of event)
    dateEndTime: datetime.datetime (Date and End time of event)
    isHoliday: def(False) bool (is it time off)
    """
    
    __tablename__ = 'UniversityEvents'
    eventId: Mapped[int] = mapped_column(primary_key=True)
    eventName: Mapped[str]
    dateStartTime: Mapped[datetime.datetime]
    dateEndTime: Mapped[datetime.datetime]
    isHoliday: Mapped[bool] = mapped_column(default=False)
    
    def __repr__(self):
        return f"Event ID: {self.eventId}, Event Name: {self.eventName}, Date and Start Time: {self.dateStartTime}, Date and End Time: {self.dateEndTime}, Is Holliday?:{self.isHoliday}"
    

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
        """Verify the password.
        
        Args:
            pass_bytes: The password to verify (string or bytes)
            
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            # Convert input to string if it's bytes
            if isinstance(pass_bytes, bytes):
                pass_bytes = pass_bytes.decode('utf-8')
                
            # Convert stored password to string if it's bytes
            stored_pass = self.password
            if isinstance(stored_pass, bytes):
                stored_pass = stored_pass.decode('utf-8')
                
            return bcrypt.checkpw(
                pass_bytes.encode('utf-8'),
                stored_pass.encode('utf-8')
            )
        except Exception as e:
            print(f"DEBUG: Password verification error in User model: {e}")
            return False

    def __repr__(self):
        return f"User(userId={self.userId}, username={self.username}, role={self.role}, roleId={self.roleId})"