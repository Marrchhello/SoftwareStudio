from database_I import *
import sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *


def getStudentGrades(engine: Engine, student_id: int):
    """Gets the grades for a student id.
    
    Params:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Course", "Assignment", "Grade"}
    """
    
    output = []
    
    with engine.connect() as conn:
        
        mega_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Grade.assignmentId == Assignment.assignmentId))
        
        for row in conn.execute(mega_select):
            output.append({"Course":row[0], "Assignment":row[1], "Grade":row[2]})
    
    return output


def getStudentGradesForCourse(engine: Engine, student_id: int, course_id):
    """Gets the grades for a student id and course_id.
    
    Params:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    course_id: course to get grades from
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Course", "Assignment", "Grade"}
    """
    
    output = []
    
    with engine.connect() as conn:
        
        grade_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Assignment.courseId == course_id, Grade.assignmentId == Assignment.assignmentId))
        
        for row in conn.execute(grade_select):
            output.append({"Course":row[0], "Assignment":row[1], "Grade":row[2]})
    
    return output


def getStudentCourses(engine: Engine, student_id: int):
    """Gets the list of subjects for a student id.
    
    Params:
    engine: Engine connection to use
    student_id: student id to get all subjects for.
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Course", "ID", "Group"}
    """
    
    output = []
    
    with engine.connect() as conn:
    
        course_select = select(CourseCatalog.courseName, CourseCatalog.courseId, CourseStudent.group).where(and_(CourseStudent.studentId == student_id, CourseCatalog.courseId == CourseStudent.courseId))

        for row in conn.execute(course_select):
                output.append({"Course":row[0], "ID":row[1], "Group":row[2]})

    return output


print(getStudentGrades(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 1))
print()
print(getStudentGrades(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 0))
print()
print(getStudentGradesForCourse(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 1, 1))
print()
print(getStudentGradesForCourse(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 0, 0))
print()
print()

print(getStudentCourses(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 0))
print()
print(getStudentCourses(create_engine('postgresql+psycopg://postgres:password@localhost/postgres'), 1))
print()