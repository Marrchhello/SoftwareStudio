from restrained_query import *
from sqlalchemy import *

# Examples for restrained query functions

engine = create_engine('postgresql+psycopg://postgres:password@localhost/postgres')

print("All grades, st_id 1: ", getStudentGrades(engine, 1), "\n")
print("All grades, st_id 0: ", getStudentGrades(engine, 0), "\n")
print("Course grades, st_id 1, c_id 1: ", getStudentGradesForCourse(engine, 1, 1), "\n")
print("Course grades, st_id 0, c_id 0: ", getStudentGradesForCourse(engine, 0, 0), "\n\n")

print("All student courses, st_id 0: ", getStudentCourses(engine, 0), "\n")
print("All student courses, st_id 1: ", getStudentCourses(engine, 1), "\n\n")

print("All student courses this semester, st_id 0: ", getStudentCoursesSemester(engine, 0), "\n")
print("All student courses this semester, st_id 1: ", getStudentCoursesSemester(engine, 1), "\n\n")

print("All courses, t_id 0: ", getTeacherCourses(engine, 0), "\n")
print("All courses, t_id 1: ", getTeacherCourses(engine, 1), "\n\n")