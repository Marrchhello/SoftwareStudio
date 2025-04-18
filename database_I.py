import sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from typing import Optional

########################################################################################################################
# CREATE TABLES
########################################################################################################################

Base = declarative_base()



# Courses, teacher, semester/year, ects credits, course id (primary)
class CourseCatalog(Base):
    __tablename__ = 'CourseCatalog'
    #courseId = Column(Integer, primary_key=True)
    courseId: Mapped[int] = mapped_column(primary_key=True)
    #courseName = Column(Text)
    courseName: Mapped[str]
    #teacherId = Column(Integer)
    teacherId: Mapped[Optional[int]]
    #semester = Column(Integer, default=1)
    semester: Mapped[int] = mapped_column(insert_default=1)
    #year = Column(Integer, default=1)
    year: Mapped[int] = mapped_column(insert_default=1)
    #ects = Column(Integer, default=1)
    ects: Mapped[int] = mapped_column(insert_default=1)

    def __repr__(self):
        return f"{self.courseId}, {self.courseName}, {self.teacher}, {self.semester}, {self.year}, {self.ects}"


# student name, id (primary), semester, year, degree id, age, email
class Student(Base):
    __tablename__ = 'Student'
    studentId: Mapped[int] = mapped_column(primary_key=True)
    semester: Mapped[int] = mapped_column(insert_default=1)
    year: Mapped[int] = mapped_column(insert_default=1)
    degreeId: Mapped[int] = mapped_column(insert_default=0)
    age: Mapped[Optional[int]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"{self.studentId}, {self.semester}, {self.year}, {self.degreeId}, {self.age}, {self.email}"


# teacher name, teacher id (primary), title/job, email
class Teacher(Base):
    __tablename__ = 'Teacher'
    teacherId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    title: Mapped[Optional[str]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"{self.teacherId}, {self.name}, {self.title}, {self.email}"


# degree id, degree name
class Degree(Base):
    __tablename__ = 'Degree'
    degreeId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]

    def __repr__(self):
        return f"{self.degreeId}, {self.name}"


# course id, room number, row id (primary)
class Room(Base):
    __tablename__ = 'Room'
    id: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int]
    building: Mapped[str]
    roomNumber: Mapped[int]

    def __repr__(self):
        return f"{self.id}, {self.courseId}, {self.building}, {self.roomNumber}"


# teacher id, course id, row id (primary)
class CourseTeacher(Base):
    __tablename__ = 'CourseTeacher'
    id: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int]
    teacherId: Mapped[int]

    def __repr__(self):
        return f"{self.id}, {self.courseId}, {self.teacherId}"


# student id, course id, key (primary)
class CourseStudent(Base):
    __tablename__ = 'CourseStudent'
    key: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int]
    studentId: Mapped[int]

    def __repr__(self):
        return f"{self.key}, {self.courseId}, {self.studentId}"

