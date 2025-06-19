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

# Grade Model
class GradeModel(BaseModel):
    """Model for storing a grade.

    Args:
        Course: str
        Assignment: opt str
        AssignmentId: opt int
        Grade: opt float
        AGH_Grade: opt float
    """
    
    Course: str
    Assignment: Optional[str]
    AssignmentId: Optional[int]
    Grade: Optional[float]
    AGH_Grade: Optional[float]


# Grade List Model
class GradeListModel(BaseModel):
    """Model for storing a list of grades.

    Args:
        GradeList: List[GradeModel]
    """
    
    GradeList: List[GradeModel] = []


# Grade Post Model
class GradePostModel(BaseModel):
    """Model for posting a grade.

    Args:
        student_id: int
        assignment_id: int
        grade: opt float
    """
    
    student_id: int
    assignment_id: int
    grade: Optional[float]


# ----------------------------------------------------------------------------
# Assignments
# ----------------------------------------------------------------------------

# Assignment Post Model
class AssignmentPostModel(BaseModel):
    """Model for posting an assignment.

    Args:
        assignment_name: str
        desc: opt str
        due_date_time: datetime.datetime
        needs_submission: bool
        assignment_intro: opt str
        valid_file_types: opt str
        group: opt int
        course_id: int
    """
    
    assignment_name: str
    desc: Optional[str]
    due_date_time: datetime.datetime
    needs_submission: bool
    valid_file_types: Optional[str]
    group: Optional[int]
    course_id: int


# ----------------------------------------------------------------------------
# Student Courses
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


# ----------------------------------------------------------------------------
# Teacher Courses
# ----------------------------------------------------------------------------

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
        EndDateTime: datetime
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


# ----------------------------------------------------------------------------
# Chat
# ----------------------------------------------------------------------------

# Chat Model
class ChatModel(BaseModel):
    """Model for a chat.
    
    Args:
        chatId: int (chat id)
        user1Id: int (first user in the chat)
        user2Id: int (second user in the chat)
    """

    chatId: int
    user1Id: int
    user2Id: int


# Chat List Model
class ChatListModel(BaseModel):
    """Model for a list of chats.
    
    Args:
        ChatList: List[ChatModel]
    """

    ChatList: List[ChatModel] = []


# Chat Message Model
class ChatMessageModel(BaseModel):
    """Model for a chat message.
    
    Args:
        chatId: int (chat the message belongs to)
        senderName: str (user who sent the message)
        message: str (the message)
        timestamp: datetime.datetime (timestamp of the message)
    """
    
    chatId: int
    senderName: str
    message: str
    timestamp: datetime.datetime


# Chat Message List Model
class ChatMessageListModel(BaseModel):
    """Model for a list of chat messages.
    
    Args:
        ChatMessageList: List[ChatMessageModel]
    """
    
    ChatMessageList: List[ChatMessageModel] = []


# ----------------------------------------------------------------------------
# Course Students
# ----------------------------------------------------------------------------

# Student Course Info Model
class StudentCourseInfoModel(BaseModel):
    """Model for student information in a course.
    
    Args:
        student_id: int
        student_name: str
        student_email: str
        group: Optional[int]
    """
    
    student_id: int
    student_name: str
    student_email: str
    group: Optional[int] = None


# Course Students List Model
class CourseStudentsListModel(BaseModel):
    """Model for a list of students in a course.
    
    Args:
        CourseName: str
        CourseId: int
        Students: List[StudentCourseInfoModel]
    """
    
    CourseName: str
    CourseId: int
    Students: List[StudentCourseInfoModel] = []


# ----------------------------------------------------------------------------
# Course Assignments
# ----------------------------------------------------------------------------

# Assignment Info Model
class AssignmentInfoModel(BaseModel):
    """Model for assignment information.
    
    Args:
        assignment_id: int
        assignment_name: str
        desc: Optional[str]
        due_date_time: datetime.datetime
        needs_submission: bool
        valid_file_types: Optional[str]
        group: Optional[int]
    """
    
    assignment_id: int
    assignment_name: str
    desc: Optional[str] = None
    due_date_time: datetime.datetime
    needs_submission: bool
    valid_file_types: Optional[str] = None
    group: Optional[int] = None


# Course Assignments List Model
class CourseAssignmentsListModel(BaseModel):
    """Model for a list of assignments in a course.
    
    Args:
        CourseName: str
        CourseId: int
        Assignments: List[AssignmentInfoModel]
    """
    
    CourseName: str
    CourseId: int
    Assignments: List[AssignmentInfoModel] = []


# ----------------------------------------------------------------------------
# Course Schedule View
# ----------------------------------------------------------------------------

# Group Schedule Model
class GroupScheduleModel(BaseModel):
    """Model for group schedule information.
    
    Args:
        GroupNumber: Optional[int]
        ClassTimes: List[StartEndTimeModel]
        Building: Optional[str]
        RoomNumber: Optional[int]
    """
    
    GroupNumber: Optional[int] = None
    ClassTimes: List[StartEndTimeModel] = []
    Building: Optional[str] = None
    RoomNumber: Optional[int] = None


# Course Group Schedule Model
class CourseGroupScheduleModel(BaseModel):
    """Model for course group schedule information.
    
    Args:
        GroupNumber: int
        DayOfWeek: str
        StartTime: datetime.time
        EndTime: datetime.time
    """
    
    GroupNumber: int
    DayOfWeek: str
    StartTime: datetime.time
    EndTime: datetime.time


# Course Schedule View Model
class CourseScheduleViewModel(BaseModel):
    """Model for course schedule view with group information.
    
    Args:
        CourseName: str
        CourseId: int
        Building: Optional[str]
        RoomNumber: Optional[int]
        isBiWeekly: bool
        Groups: List[CourseGroupScheduleModel]
    """
    
    CourseName: str
    CourseId: int
    Building: Optional[str] = None
    RoomNumber: Optional[int] = None
    isBiWeekly: bool = False
    Groups: List[CourseGroupScheduleModel] = []
    
    
    
    
    

    
    
    
    
    
    
