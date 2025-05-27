from backend.Database import *
from backend.Models import *
import sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *

def __convert_grade_to_AGH__(grade: float) -> float:
    """Converts grade (0.0-100.0) to AGH Grade (2.0,3.0,etc)

    Args:
        grade (float): 0.0 - 100.0 grade

    Returns:
        float: 2.0, 3.0, 3.5, 4.0, 4.5, 5.0
    """
    
    if grade is None:
        return None
    elif grade < 50.0:
        return 2.0
    elif grade < 60.0:
        return 3.0
    elif grade < 70.0:
        return 3.5
    elif grade < 80.0:
        return 4.0
    elif grade < 90.0:
        return 4.5
    else:
        return 5.0
    

# Get all grades for a student.
# def getStudentGrades(engine: Engine, student_id: int):
#     """Gets the grades for a student id.
    
#     Args:
#     engine: Engine connection to use
#     student_id: student id to get all grades for.
    
#     Returns:
#     output: []  list of dictionaries. Dict format: {"Course", "Assignment", "Grade"}
#     """
    
#     output = []
    
#     with engine.connect() as conn:
        
#         mega_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Grade.assignmentId == Assignment.assignmentId))
        
#         for row in conn.execute(mega_select):
#             output.append({"Course":row[0], "Assignment":row[1], "Grade":row[2]})
    
#     return output

# Get all grades for a student.
# V2: models output
def getStudentGrades(engine: Engine, student_id: int):
    """Gets the grades for a student id.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    
    Returns:
    output: GradeListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
        
        mega_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Grade.assignmentId == Assignment.assignmentId))
        
        for row in conn.execute(mega_select):
            output.append(GradeModel(Course=row[0], Assignment=row[1], Grade=row[2], AGH_Grade=__convert_grade_to_AGH__(row[2])))
    
    return GradeListModel(GradeList=output)


# Get all grades for a student in a specific course.
# def getStudentGradesForCourse(engine: Engine, student_id: int, course_id):
#     """Gets the grades for a student id and course_id.
    
#     Args:
#     engine: Engine connection to use
#     student_id: student id to get all grades for.
#     course_id: course to get grades from
    
#     Returns:
#     output: []  list of dictionaries. Dict format: {"Course", "Assignment", "Grade"}
#     """
    
#     output = []
    
#     with engine.connect() as conn:
        
#         grade_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Assignment.courseId == course_id, Grade.assignmentId == Assignment.assignmentId))
        
#         for row in conn.execute(grade_select):
#             output.append({"Course":row[0], "Assignment":row[1], "Grade":row[2]})
    
#     return output


# Get all grades for a student in a specific course.
# V2: models output
def getStudentGradesForCourse(engine: Engine, student_id: int, course_id: int):
    """Gets the grades for a student id and course_id.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    course_id: course to get grades from
    
    Returns:
    output: GradeListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
        
        grade_select = select(CourseCatalog.courseName, Assignment.name, Grade.grade).where(and_(Grade.studentId == student_id, Assignment.courseId == CourseCatalog.courseId, Assignment.courseId == course_id, Grade.assignmentId == Assignment.assignmentId))
        
        for row in conn.execute(grade_select):
            output.append(GradeModel(Course=row[0], Assignment=row[1], Grade=row[2], AGH_Grade=__convert_grade_to_AGH__(row[2])))
    
    return GradeListModel(GradeList=output)


# Get all courses a student is in.
# def getStudentCourses(engine: Engine, student_id: int):
#     """Gets the list of subjects for a student id.
    
#     Args:
#     engine: Engine connection to use
#     student_id: student id to get all subjects for.
    
#     Returns:
#     output: []  list of dictionaries. Dict format: {"Course", "ID", "Group"}
#     """
    
#     output = []
    
#     with engine.connect() as conn:
    
#         course_select = select(CourseCatalog.courseName, CourseCatalog.courseId, CourseStudent.group).where(and_(CourseStudent.studentId == student_id, CourseCatalog.courseId == CourseStudent.courseId))

#         for row in conn.execute(course_select):
#                 output.append({"Course":row[0], "ID":row[1], "Group":row[2]})

#     return output

# Get all courses a student is in.
# V2: models output
def getStudentCourses(engine: Engine, student_id: int):
    """Gets the list of subjects for a student id.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all subjects for.
    
    Returns:
    output: StudentCourseListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
    
        course_select = select(CourseCatalog.courseName, CourseCatalog.courseId, CourseStudent.group).where(and_(CourseStudent.studentId == student_id, CourseCatalog.courseId == CourseStudent.courseId))

        for row in conn.execute(course_select):
                output.append(StudentCourseModel(Course=row[0], ID=row[1], Group=row[2]))

    return StudentCourseListModel(CourseList=output)


# Get all courses a student is in, limit by this semester.
# def getStudentCoursesSemester(engine: Engine, student_id: int):
#     """Gets the list of subjects for a student id, limit by current semester.
    
#     Args:
#     engine: Engine connection to use
#     student_id: student id to get all subjects for.
    
#     Returns:
#     output: []  list of dictionaries. Dict format: {"Course", "ID", "Group"}
#     """
    
#     output = []
    
#     with engine.connect() as conn:
    
#         course_select = select(CourseCatalog.courseName, CourseCatalog.courseId, CourseStudent.group).where(and_(CourseStudent.studentId == student_id, CourseCatalog.courseId == CourseStudent.courseId, Student.semester == CourseCatalog.semester, Student.studentId == student_id))

#         for row in conn.execute(course_select):
#                 output.append({"Course":row[0], "ID":row[1], "Group":row[2]})

#     return output


# Get all courses a student is in, limit by this semester.
# V2: models output
def getStudentCoursesSemester(engine: Engine, student_id: int):
    """Gets the list of subjects for a student id, limit by current semester.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all subjects for.
    
    Returns:
    output: StudentCourseListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
    
        course_select = select(CourseCatalog.courseName, CourseCatalog.courseId, CourseStudent.group).where(and_(CourseStudent.studentId == student_id, CourseCatalog.courseId == CourseStudent.courseId, Student.semester == CourseCatalog.semester, Student.studentId == student_id))

        for row in conn.execute(course_select):
                output.append(StudentCourseModel(Course=row[0], ID=row[1], Group=row[2]))

    return StudentCourseListModel(CourseList=output)


# Get all courses a teacher is in.
# def getTeacherCourses(engine: Engine, teacher_id: int):
#     """Gets the list of subjects for a teacher id.
    
#     Args:
#     engine: Engine connection to use
#     teacher_id: teacher id to get all subjects for.
    
#     Returns:
#     output: []  list of dictionaries. Dict format: {"Course", "ID"}
#     """
    
#     output = []
    
#     with engine.connect() as conn:
    
#         course_select = select(CourseCatalog.courseName, CourseCatalog.courseId).where(and_(CourseTeacher.teacherId == teacher_id, CourseCatalog.courseId == CourseTeacher.courseId))

#         for row in conn.execute(course_select):
#                 output.append({"Course":row[0], "ID":row[1]})

#     return output


# Get all courses a teacher is in.
# V2: models output
def getTeacherCourses(engine: Engine, teacher_id: int):
    """Gets the list of subjects for a teacher id.
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id to get all subjects for.
    
    Returns:
    output: TeacherCoursesListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
    
        course_select = select(CourseCatalog.courseName, CourseCatalog.courseId).where(and_(CourseTeacher.teacherId == teacher_id, CourseCatalog.courseId == CourseTeacher.courseId))

        for row in conn.execute(course_select):
                output.append(TeacherCourseModel(Course=row[0], ID=row[1]))

    return TeacherCourseListModel(TeacherCourseList=output)


# Get All University Events
def getUniversityEvents(engine: Engine):
    """Gets all the events stored in UniversityEvents.
    
    Note:
    The Date/Start and Date/End of output store a datetime.datetime object. It can be used normally.
    
    Args:
    engine: Engine connection to use.
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Event ID", "Event Name", "Date and Start Time", "Date and End Time", "Holiday"}
    """
    
    output = []
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents)
        
        for row in conn.execute(event_select):
            output.append({"Event ID":row[0], "Event Name":row[1], "Date and Start Time":row[2], "Date and End Time":row[3], "Holiday":row[4]})
            
    return output


# Get University Events From Today On or From Custom Start Date/Time
def getCustomUniversityEvents(engine: Engine, start_date: datetime.datetime = None):
    """Gets all the events stored in UniversityEvents starting from either today, or custom start.
    
    Note:
    The Date/Start and Date/End of output store a datetime.datetime object. It can be used normally.
    
    Args:
    engine: Engine connection to use.
    start_date: datetime.datetime (Custom start date and time)
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Event ID", "Event Name", "Date and Start Time", "Date and End Time", "Holiday"}
    """
    
    output = []
    
    if start_date is None:
        start_date = datetime.datetime.today()
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents).where(UniversityEvents.dateStartTime >= start_date)
        
        for row in conn.execute(event_select):
            output.append({"Event ID":row[0], "Event Name":row[1], "Date and Start Time":row[2], "Date and End Time":row[3], "Holiday":row[4]})
            
    return output


# Get All Holidays From University Events
def getHolidays(engine: Engine):
    """Gets all the holidays stored in UniversityEvents.
    
    Note:
    The Date/Start and Date/End of output store a datetime.datetime object. It can be used normally.
    
    Args:
    engine: Engine connection to use.
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Event ID", "Event Name", "Date and Start Time", "Date and End Time", "Holiday"}
    """
    
    output = []
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents).where(UniversityEvents.isHoliday == True)
        
        for row in conn.execute(event_select):
            output.append({"Event ID":row[0], "Event Name":row[1], "Date and Start Time":row[2], "Date and End Time":row[3], "Holiday":row[4]})
            
    return output


# Get All Holidays From University Events From Today or Custom Start
def getCustomHolidays(engine: Engine, start_date: datetime.datetime = None):
    """Gets all the holidays stored in UniversityEvents, from today or from custom start.
    
    Note:
    The Date/Start and Date/End of output store a datetime.datetime object. It can be used normally.
    
    Args:
    engine: Engine connection to use.
    start_date: datetime.datetime (Custom start date and time)
    
    Returns:
    output: []  list of dictionaries. Dict format: {"Event ID", "Event Name", "Date and Start Time", "Date and End Time", "Holiday"}
    """
    
    output = []
    
    if start_date is None:
        start_date = datetime.datetime.today()
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents).where(and_(UniversityEvents.isHoliday == True, UniversityEvents.dateStartTime >= start_date))
        
        for row in conn.execute(event_select):
            output.append({"Event ID":row[0], "Event Name":row[1], "Date and Start Time":row[2], "Date and End Time":row[3], "Holiday":row[4]})
            
    return output


# Get FAQ questions and answers
def getFAQ(engine: Engine):
    """Get all FAQ from db.

    Args:
        engine: Engine connection to use.
        
    Returns:
        output: FAQListModel
    """
    
    output = []
    
    with engine.connect() as conn:
        
        faq_select = select(FAQ.question, FAQ.answer)
        
        for row in conn.execute(faq_select):
            output.append(FAQModel(Question=row[0], Answer=row[1]))
            
    return FAQListModel(FAQList=output)