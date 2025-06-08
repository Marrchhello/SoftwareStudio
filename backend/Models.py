from pydantic import BaseModel
from typing import List, Optional
import datetime

# Create Models for info that should be converted to json upon get/post request

# Sample model:
# class GradeModel(BaseModel):
#     Course: str
#     Assignment: str
#     Grade: float

# This, upon being returned in get request, automatically converts stored info to json.

# ----------------------------------------------------------------------------
# Grades
# ----------------------------------------------------------------------------

# Grades Model
class GradeModel(BaseModel):
    """Model for storing a grade.

    Args:
        Course: str
        Assignment: opt str
        Grade: opt float
        AGH_Grade: opt float
    """
    
    Course: str
    Assignment: Optional[str]
    Grade: Optional[float]
    AGH_Grade: Optional[float]


# Grade List Model
class GradeListModel(BaseModel):
    """Model for storing a list of grades.

    Args:
        GradeList: List[GradeModel]
    """
    
    GradeList: List[GradeModel] = []
 
# ----------------------------------------------------------------------------
# Courses
# ----------------------------------------------------------------------------
    
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
    
# ----------------------------------------------------------------------------
# FAQ
# ----------------------------------------------------------------------------
    
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
    
    
# ----------------------------------------------------------------------------
# Schedule
# ----------------------------------------------------------------------------
    
# Start End Time Model
class StartEndTimeModel(BaseModel):
    """A model for storing a start datetime and an end datetime.
    
    Args:
        StartDateTime: datetime
        EndDateDtime: datetime
    """
    
    StartDateTime: datetime.datetime
    EndDateTime: datetime.datetime


# Event Schedule Model
class EventScheduleModel(BaseModel):
    """Model for Events part of Schedule

    Args:
        EventTime: StartEndTimeModel
        EventName: str
        IsHoliday: bool
    """
    
    EventTime: StartEndTimeModel
    EventName: str
    IsHoliday: bool = False
    
    
# Assignment Schedule Model
class AssignmentScheduleModel(BaseModel):
    """Model for Assignments part of Schedule

    Args:
        CourseName: str
        AssignmentDueDateTime: datetime.datetime
        AssignmentName: str
    """
    
    CourseName: str
    AssignmentDueDateTime: datetime.datetime
    AssignmentName: str


# Class Schedule Model
class ClassScheduleModel(BaseModel):
    """Model for a single Class.
    
    Args:
        ClassTime: StartEndTimeModel
        CourseName: str
        Building: opt str
        RoomNumber: opt int
    """
    
    ClassTime: List[StartEndTimeModel] = []
    CourseName: str
    Building: Optional[str]
    RoomNumber: Optional[int]


# Course Schedule Model
class CourseScheduleModel(BaseModel):
    """Model for Courses part of Schedule.
    
    Args:
        ClassSchedule: ClassScheduleModel
        isBiWeekly: bool
    """
    
    ClassSchedule: ClassScheduleModel
    isBiWeekly: bool = False
    
    
# Schedule Model
class ScheduleModel(BaseModel):
    """Stores the entire schedule in one model.

    Args:
        Courses (List[CourseScheduleModel]): List of course schedules.
        Events (List[EventScheduleModel]): List of event schedules.
        Assignments (List[AssignmentScheduleModel]): List of assignment schedules.
    """
    
    Courses: List[CourseScheduleModel] = []
    Events: List[EventScheduleModel] = []
    Assignments: List[AssignmentScheduleModel] = []


# Uni Event Schedule Model
class UniEventScheduleModel(BaseModel):
    """Model for University Events part of Schedule.
    
    Args:
        Events: List[EventScheduleModel]
    """
    
    Events: List[EventScheduleModel] = []

    
    
    
    
    
    
