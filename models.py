from sqlalchemy import create_engine, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Optional

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = 'Student'
    studentId: Mapped[int] = mapped_column(primary_key=True)
    semester: Mapped[int] = mapped_column(insert_default=1)
    year: Mapped[int] = mapped_column(insert_default=1)
    degreeId: Mapped[int] = mapped_column(ForeignKey('Degree.degreeId'), insert_default=0)
    age: Mapped[Optional[int]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"Student(id={self.studentId}, semester={self.semester}, year={self.year})"

class CourseCatalog(Base):
    __tablename__ = 'CourseCatalog'
    courseId: Mapped[int] = mapped_column(primary_key=True)
    courseName: Mapped[str]
    teacherId: Mapped[Optional[int]] = mapped_column(ForeignKey('Teacher.teacherId'))
    semester: Mapped[int] = mapped_column(insert_default=1)
    year: Mapped[int] = mapped_column(insert_default=1)
    ects: Mapped[int] = mapped_column(insert_default=1)

    def __repr__(self):
        return f"Course(id={self.courseId}, name={self.courseName})"

class Teacher(Base):
    __tablename__ = 'Teacher'
    teacherId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    title: Mapped[Optional[str]]
    email: Mapped[Optional[str]]

    def __repr__(self):
        return f"Teacher(id={self.teacherId}, name={self.name})"

class Degree(Base):
    __tablename__ = 'Degree'
    degreeId: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]

    def __repr__(self):
        return f"Degree(id={self.degreeId}, name={self.name})"

class Room(Base):
    __tablename__ = 'Room'
    id: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    building: Mapped[str]
    roomNumber: Mapped[int]

    def __repr__(self):
        return f"Room(id={self.id}, building={self.building}, number={self.roomNumber})"

class CourseTeacher(Base):
    __tablename__ = 'CourseTeacher'
    id: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    teacherId: Mapped[int] = mapped_column(ForeignKey('Teacher.teacherId'))

    def __repr__(self):
        return f"CourseTeacher(course_id={self.courseId}, teacher_id={self.teacherId})"

class CourseStudent(Base):
    __tablename__ = 'CourseStudent'
    key: Mapped[int] = mapped_column(primary_key=True)
    courseId: Mapped[int] = mapped_column(ForeignKey('CourseCatalog.courseId'))
    studentId: Mapped[int] = mapped_column(ForeignKey('Student.studentId'))

    def __repr__(self):
        return f"CourseStudent(course_id={self.courseId}, student_id={self.studentId})"

class Grade(Base):
    __tablename__ = 'Grade'
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[int] = mapped_column(ForeignKey('CourseStudent.key'))
    grade: Mapped[float]

    def __repr__(self):
        return f"Grade(id={self.id}, grade={self.grade})"
    
