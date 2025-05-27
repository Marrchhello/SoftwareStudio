from pydantic import BaseModel
from typing import List, Optional

# Create Models for info that should be converted to json upon get/post request

# Sample model:
# class GradeModel(BaseModel):
#     Course: str
#     Assignment: str
#     Grade: float

# This, upon being returned in get request, automatically converts stored info to json.

# Models:

# Grades Model
class GradeModel(BaseModel):
    """Model for storing a grade.

    Args:
        Course: str
        Assignment: str
        Grade: opt float
        AGH_Grade: opt float
    """
    
    Course: str
    Assignment: str
    Grade: Optional[float]
    AGH_Grade: Optional[float]


# Grade List Model
class GradeListModel(BaseModel):
    """Model for storing a list of grades.

    Args:
        GradeList: List[GradeModel]
    """
    
    GradeList: List[GradeModel] = []
 
    
# Student Course Model
class StudentCourseModel(BaseModel):
    """Model for storing a student course.

    Args:
        Course: str
        ID: int
        Group: opt int
    """
    
    Course: str
    ID: int
    Group: Optional[int]


# Student Course List Model
class StudentCourseListModel(BaseModel):
    """Model for storing a list of student courses.

    Args:
        CourseList: List[StudentCourseModel]
    """
    
    CourseList: List[StudentCourseModel] = []
    
    
# Teacher Course Model
class TeacherCourseModel(BaseModel):
    """Model for storing a teacher course.

    Args:
        Course: str
        ID: int
    """
    
    Course: str
    ID: int


# Teacher Course List Model
class TeacherCourseListModel(BaseModel):
    """Model for storing a list of teacher courses.

    Args:
        CourseList: List[TeacherCourseModel]
    """
    
    CourseList: List[TeacherCourseModel] = []
    
    
# FAQ Model
class FAQModel(BaseModel):
    """Model for storing a FAQ question and answer.

    Args:
        Question: str
        Answer: str
    """
    
    Question: str
    Answer: str
    
    
# FAQ List Model
class FAQListModel(BaseModel):
    """Model for storing a list of FAQ questions and answers.

    Args:
        FAQList: List[FAQModel]
    """
    
    FAQList: List[FAQModel] = []