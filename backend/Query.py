from Database import *
from Models import *
from sqlalchemy import *
from sqlalchemy.orm import *

# ----------------------------------------------------------------------------
# Grades
# ----------------------------------------------------------------------------

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
# V7: This function now returns all assignments for courses the student is enrolled in for their current semester, with grades if they exist.
# Only shows assignments that are either assigned to the student's group or have no group restriction.
def getStudentGrades(engine: Engine, student_id: int):
    """Gets all assignments for courses the student is enrolled in for their current semester, with grades if they exist.
    Only shows assignments that are either assigned to the student's group or have no group restriction.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    
    Returns:
    output: GradeListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
        
        # Get all assignments for courses the student is enrolled in for their current semester
        # Include assignments even if they don't have grades yet
        # Filter by group: assignment has no group restriction OR assignment group matches student's group
        assignment_select = select(
            CourseCatalog.courseName, 
            Assignment.name, 
            Grade.grade
        ).select_from(
            Assignment
        ).join(
            CourseCatalog, Assignment.courseId == CourseCatalog.courseId
        ).join(
            CourseStudent, and_(
                CourseStudent.courseId == CourseCatalog.courseId,
                CourseStudent.studentId == student_id
            )
        ).join(
            Student, and_(
                Student.studentId == student_id,
                Student.semester == CourseCatalog.semester
            )
        ).outerjoin(
            Grade, and_(
                Grade.assignmentId == Assignment.assignmentId,
                Grade.studentId == student_id
            )
        ).where(
            or_(
                Assignment.group == None,  # Assignment has no group restriction
                Assignment.group == CourseStudent.group  # Assignment group matches student's group for this course
            )
        ).order_by(CourseCatalog.courseName, Assignment.name)
        
        for row in conn.execute(assignment_select):
            output.append(GradeModel(
                Course=row[0], 
                Assignment=row[1], 
                Grade=row[2], 
                AGH_Grade=__convert_grade_to_AGH__(row[2]) if row[2] is not None else None
            ))
    
    return GradeListModel(GradeList=output)


# Get all grades for a student in a specific course.
# V3: models output, now includes group filtering
def getStudentGradesForCourse(engine: Engine, student_id: int, course_id: int):
    """Gets the grades for a student id and course_id.
    Only shows assignments that are either assigned to the student's group or have no group restriction.
    
    Args:
    engine: Engine connection to use
    student_id: student id to get all grades for.
    course_id: course to get grades from
    
    Returns:
    output: GradeListModel from models.py
    """
    
    output = []
    
    with engine.connect() as conn:
        
        # Get student's group for this course
        student_group_query = select(CourseStudent.group).where(
            and_(CourseStudent.studentId == student_id, CourseStudent.courseId == course_id)
        )
        student_group = conn.execute(student_group_query).scalar()
        
        # Get grades for assignments that either have no group restriction or match student's group
        grade_select = select(
            CourseCatalog.courseName, 
            Assignment.name, 
            Grade.grade
        ).select_from(
            Grade
        ).join(
            Assignment, Grade.assignmentId == Assignment.assignmentId
        ).join(
            CourseCatalog, Assignment.courseId == CourseCatalog.courseId
        ).where(
            and_(
                Grade.studentId == student_id,
                Assignment.courseId == course_id,
                or_(
                    Assignment.group == None,  # Assignment has no group restriction
                    Assignment.group == student_group  # Assignment group matches student's group
                )
            )
        )
        
        for row in conn.execute(grade_select):
            output.append(GradeModel(Course=row[0], Assignment=row[1], Grade=row[2], AGH_Grade=__convert_grade_to_AGH__(row[2])))
    
    return GradeListModel(GradeList=output)


# Post grade with model
def postGrade(engine: Engine, teacher_id: int, model: GradePostModel):
    """Posts a grade for a student in a course.
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id who is attempting to post the grade.
    model: GradePostModel (teacher_id, student_id, assignment_id, grade (opt))
    
    Returns:
    dictionary with status_code and detail
    """

    with engine.connect() as conn:

        # check if teacher is teaching the course
        teacher_teaching = select(CourseTeacher.teacherId).select_from(
            Assignment
        ).join(
            CourseTeacher, Assignment.courseId == CourseTeacher.courseId
        ).where(
            and_(
                Assignment.assignmentId == model.assignment_id,
                CourseTeacher.teacherId == teacher_id
            )
        )
        teacher_result = conn.execute(teacher_teaching).fetchone()
        if teacher_result is None:
            return {"status_code": 403, "detail": "Teacher is not teaching the course"}
        
        # check if assignment exists
        assignment_exists = select(Assignment).where(Assignment.assignmentId == model.assignment_id)
        if conn.execute(assignment_exists).fetchone() is None:
            return {"status_code": 404, "detail": "Assignment does not exist"}
        
        # check if student is in the course
        student_in_course = select(CourseStudent).select_from(
            Assignment
        ).join(
            CourseStudent, Assignment.courseId == CourseStudent.courseId
        ).where(
            and_(
                Assignment.assignmentId == model.assignment_id,
                CourseStudent.studentId == model.student_id
            )
        )
        if conn.execute(student_in_course).fetchone() is None:
            return {"status_code": 403, "detail": "Student is not in the course"}

        # check if grade already exists
        grade_exists = select(Grade).where(and_(Grade.studentId == model.student_id, Grade.assignmentId == model.assignment_id))
        if conn.execute(grade_exists).fetchone() is not None:
            # update grade
            grade_update = update(Grade).where(and_(Grade.studentId == model.student_id, Grade.assignmentId == model.assignment_id)).values(grade=model.grade)
            conn.execute(grade_update)
            conn.commit()
        else:
            # get max grade_id from Grade table
            max_grade_id = select(func.max(Grade.gradeId)).as_scalar()
            grade_insert = insert(Grade).values(gradeId=max_grade_id + 1, studentId=model.student_id, assignmentId=model.assignment_id, grade=model.grade)
            conn.execute(grade_insert)
            conn.commit()
        
        return {"status_code": 200, "detail": "Grade posted successfully"}


# ----------------------------------------------------------------------------
# Assignments
# ----------------------------------------------------------------------------

# Post Assignment
def postAssignment(engine: Engine, teacher_id: int, model: AssignmentPostModel):
    """Posts an assignment for a course.
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id who is attempting to post the assignment.
    model: AssignmentPostModel (teacher_id, course_id, assignment_name, desc, due_date_time, needs_submission, valid_file_types, group)
    
    Returns:
    dictionary with status_code and detail
    """

    with engine.connect() as conn:

        # check if teacher is teaching the course
        teacher_teaching = select(CourseTeacher).where(and_(CourseTeacher.courseId == model.course_id, CourseTeacher.teacherId == teacher_id))
        teacher_result = conn.execute(teacher_teaching).fetchone()
        if teacher_result is None:
            return {"status_code": 403, "detail": "Teacher is not teaching the course"}
        
        # Check if course exists
        course_exists = select(CourseCatalog).where(and_(CourseCatalog.courseId == model.course_id))
        if conn.execute(course_exists).fetchone() is None:
            return {"status_code": 404, "detail": "Course does not exist"}
        
        # check if assignment already exists. if so, update. else, insert.
        assignment_exists = select(Assignment).where(and_(Assignment.name == model.assignment_name, Assignment.courseId == model.course_id, Assignment.group == model.group))
        if conn.execute(assignment_exists).fetchone() is not None:
            assignment_update = update(Assignment).where(and_(Assignment.name == model.assignment_name, Assignment.courseId == model.course_id, Assignment.group == model.group)).values(desc=model.desc, dueDateTime=model.due_date_time, needsSubmission=model.needs_submission, validFileTypes=model.valid_file_types)
            conn.execute(assignment_update)
            conn.commit()
        else:
            # get max value for assignment_id from Assignment table
            max_assignment_id = select(func.max(Assignment.assignmentId)).as_scalar()
            assignment_insert = insert(Assignment).values(assignmentId=max_assignment_id + 1, name=model.assignment_name, desc=model.desc, dueDateTime=model.due_date_time, needsSubmission=model.needs_submission, validFileTypes=model.valid_file_types, group=model.group, courseId=model.course_id)
            conn.execute(assignment_insert)
            conn.commit()

        return {"status_code": 200, "detail": "Assignment posted successfully"}


# ----------------------------------------------------------------------------
# Courses
# ----------------------------------------------------------------------------

# Get all courses a student is in for their current semester.
# V3: models output, now filters by current semester
def getStudentCourses(engine: Engine, student_id: int):
    """Gets the list of subjects for a student id for their current semester.
    
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


# Note: getStudentCoursesSemester function removed as getStudentCourses now filters by semester by default


# Get all courses a teacher is in.
# V2: models output
def getTeacherCourses(engine: Engine, teacher_id: int):
    """Gets the list of subjects for a teacher id.
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id to get all subjects for.
    
    Returns:
    output: TeacherCourseListModel from models.py
    """
    
    print(f"DEBUG: getTeacherCourses called with teacher_id: {teacher_id}")
    output = []
    
    try:
        with engine.connect() as conn:
            print(f"DEBUG: Connected to database")
            
            course_select = select(CourseCatalog.courseName, CourseCatalog.courseId).select_from(
                CourseTeacher
            ).join(
                CourseCatalog, CourseTeacher.courseId == CourseCatalog.courseId
            ).where(CourseTeacher.teacherId == teacher_id)
            
            print(f"DEBUG: Executing query...")
            result = conn.execute(course_select)
            
            for row in result:
                print(f"DEBUG: Found course: {row[0]} (ID: {row[1]})")
                output.append(TeacherCourseModel(Course=row[0], ID=row[1]))
            
            print(f"DEBUG: Total courses found: {len(output)}")
            
        return TeacherCourseListModel(CourseList=output)
    except Exception as e:
        print(f"DEBUG: Error in getTeacherCourses: {e}")
        import traceback
        traceback.print_exc()
        raise


def getCourseSchedule(engine: Engine, course_id: int, date: datetime.date = None):
    """Gets the schedule for a specific course starting from a specific date.
    
    Args:
        engine (Engine): Engine connection to use.
        course_id (int): Course ID to get schedule for.
        date (datetime.date): Date to start the schedule from.

    Returns:
        ClassScheduleModel: Class Schedule.
    """

    if date is None:
        date = datetime.date.today()

    day_start = datetime.datetime.combine(date, datetime.time.min)

    with engine.connect() as conn:
        course_info_sel = select(
            CourseCatalog.courseName,
            Room.building,
            Room.roomNumber
        ).where(
            and_(
                CourseCatalog.courseId == course_id,
                Room.courseId == CourseCatalog.courseId
            )
        )

        course_info = conn.execute(course_info_sel).fetchone()

        if course_info is None:
            return ClassScheduleModel(ClassTime=[], CourseName="", Building=None, RoomNumber=None)

        course_name, building, room_number = course_info

        class_times = select(
            ClassDateTime.dateStartTime,
            ClassDateTime.endTime
        ).where(
            and_(
                ClassDateTime.dateStartTime >= day_start,
                ClassDateTime.courseId == course_id
            )
        )

        class_times = conn.execute(class_times).fetchall()
        
        class_times = [StartEndTimeModel(
            StartDateTime=date_start_time,
            EndDateTime=datetime.datetime.combine(date_start_time.date(), end_time)
        ) for date_start_time, end_time in class_times]

        class_model = ClassScheduleModel(
            ClassTime=class_times,
            CourseName=course_name,
            Building=building,
            RoomNumber=room_number
        )
        return class_model


# ----------------------------------------------------------------------------
# Schedule Helper Functions
# ----------------------------------------------------------------------------

def _calculate_date_range(date: datetime.date, period: str) -> tuple[datetime.datetime, datetime.datetime]:
    """Calculate start and end datetime for different time periods.
    
    Args:
        date: The reference date
        period: 'day', 'week', or 'month'
    
    Returns:
        tuple of (start_datetime, end_datetime)
    """
    if date is None:
        date = datetime.date.today()
    
    if period == 'day':
        start = datetime.datetime.combine(date, datetime.time.min)
        end = datetime.datetime.combine(date, datetime.time.max)
    elif period == 'week':
        # Monday to Sunday
        week_start = date - datetime.timedelta(days=date.weekday())
        week_end = week_start + datetime.timedelta(days=6)
        start = datetime.datetime.combine(week_start, datetime.time.min)
        end = datetime.datetime.combine(week_end, datetime.time.max)
    elif period == 'month':
        # First day to last day of month
        month_start = date.replace(day=1)
        if date.month == 12:
            next_month = date.replace(year=date.year + 1, month=1, day=1)
        else:
            next_month = date.replace(month=date.month + 1, day=1)
        month_end = next_month - datetime.timedelta(days=1)
        start = datetime.datetime.combine(month_start, datetime.time.min)
        end = datetime.datetime.combine(month_end, datetime.time.max)
    else:
        raise ValueError(f"Invalid period: {period}. Must be 'day', 'week', or 'month'")
    
    return start, end


def _get_events_in_range(conn, start_time: datetime.datetime, end_time: datetime.datetime) -> list[EventScheduleModel]:
    """Get university events that overlap with the given time range.
    
    Args:
        conn: Database connection
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        List of EventScheduleModel objects
    """
    events_query = select(
        UniversityEvents.eventName,
        UniversityEvents.dateStartTime,
        UniversityEvents.dateEndTime,
        UniversityEvents.isHoliday
    ).where(
        and_(
            UniversityEvents.dateStartTime <= end_time,
            UniversityEvents.dateEndTime >= start_time
        )
    )
    
    events = []
    for row in conn.execute(events_query):
        event_name, date_start_time, date_end_time, is_holiday = row
        event_times = StartEndTimeModel(
            StartDateTime=date_start_time,
            EndDateTime=date_end_time
        )
        event_model = EventScheduleModel(
            EventTime=event_times,
            EventName=event_name,
            IsHoliday=is_holiday
        )
        events.append(event_model)
    
    return events


def _get_class_times_for_course(conn, course_id: int, start_time: datetime.datetime, end_time: datetime.datetime) -> list[StartEndTimeModel]:
    """Get class times for a specific course within a time range.
    
    Args:
        conn: Database connection
        course_id: Course ID
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        List of StartEndTimeModel objects
    """
    class_times_sel = select(
        ClassDateTime.dateStartTime,
        ClassDateTime.endTime
    ).where(
        and_(
            ClassDateTime.courseId == course_id,
            ClassDateTime.dateStartTime >= start_time,
            ClassDateTime.dateStartTime < end_time
        )
    )
    
    class_times = conn.execute(class_times_sel).fetchall()
    return [StartEndTimeModel(
        StartDateTime=date_start_time,
        EndDateTime=datetime.datetime.combine(date_start_time.date(), end_time)
    ) for date_start_time, end_time in class_times]


def _process_courses_data(conn, courses_query, start_time: datetime.datetime, end_time: datetime.datetime) -> list[CourseScheduleModel]:
    """Process courses data into CourseScheduleModel objects.
    
    Args:
        conn: Database connection
        courses_query: SQLAlchemy query for courses
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        List of CourseScheduleModel objects
    """
    courses = []
    for row in conn.execute(courses_query):
        # All queries now include course_id
        course_name, course_id, is_biweekly, building, room_number = row
        
        class_times = _get_class_times_for_course(conn, course_id, start_time, end_time)
        
        class_model = ClassScheduleModel(
            ClassTime=class_times,
            CourseName=course_name,
            Building=building,
            RoomNumber=room_number
        )
        
        course_model = CourseScheduleModel(
            ClassSchedule=class_model,
            isBiWeekly=is_biweekly
        )
        courses.append(course_model)
    
    return courses


def _get_student_assignments_in_range(conn, student_id: int, start_time: datetime.datetime, end_time: datetime.datetime) -> list[AssignmentScheduleModel]:
    """Get assignments for a student within a time range.
    
    Args:
        conn: Database connection
        student_id: Student ID
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        List of AssignmentScheduleModel objects
    """
    assignments_query = select(
        CourseCatalog.courseName,
        Assignment.name,
        Assignment.dueDateTime
    ).select_from(Assignment).join(
        CourseCatalog,
        Assignment.courseId == CourseCatalog.courseId
    ).outerjoin(
        AssignmentSubmission,
        and_(
            Assignment.assignmentId == AssignmentSubmission.assignmentId,
            AssignmentSubmission.studentId == student_id
        )
    ).outerjoin(
        CourseStudent,
        and_(
            Assignment.courseId == CourseStudent.courseId,
            CourseStudent.studentId == student_id
        )
    ).outerjoin(
        Student,
        Student.studentId == student_id
    ).where(
        and_(
            Assignment.dueDateTime >= start_time,
            Assignment.dueDateTime < end_time,
            Student.semester == CourseCatalog.semester,
            or_(
                Assignment.needsSubmission == False,
                and_(
                    Assignment.needsSubmission == True,
                    or_(
                        AssignmentSubmission.submission == None,
                        AssignmentSubmission.submission == ''
                    )
                )
            ),
            or_(
                Assignment.group == None,
                Assignment.group == CourseStudent.group
            )
        )
    )
    
    assignments = []
    for row in conn.execute(assignments_query):
        course_name, assignment_name, due_date_time = row
        assignment_model = AssignmentScheduleModel(
            CourseName=course_name,
            AssignmentDueDateTime=due_date_time,
            AssignmentName=assignment_name,
        )
        assignments.append(assignment_model)
    
    return assignments


def _get_teacher_courses_query(teacher_id: int, start_time: datetime.datetime, end_time: datetime.datetime):
    """Create a query for teacher's courses within a time range.
    
    Args:
        teacher_id: Teacher ID
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        SQLAlchemy query object
    """
    return select(distinct(CourseCatalog.courseName), CourseCatalog.courseId, CourseCatalog.isBiWeekly, Room.building, Room.roomNumber).where(
        and_(
            ClassDateTime.dateStartTime >= start_time,
            ClassDateTime.dateStartTime < end_time,
            CourseCatalog.courseId == ClassDateTime.courseId,
            Room.courseId == CourseCatalog.courseId,
            CourseTeacher.teacherId == teacher_id,
            CourseTeacher.courseId == CourseCatalog.courseId
        )
    )


def _get_student_courses_query(student_id: int, start_time: datetime.datetime, end_time: datetime.datetime):
    """Create a query for student's courses within a time range.
    
    Args:
        student_id: Student ID
        start_time: Start of time range
        end_time: End of time range
    
    Returns:
        SQLAlchemy query object
    """
    return select(distinct(CourseCatalog.courseName), CourseCatalog.courseId, CourseCatalog.isBiWeekly, Room.building, Room.roomNumber).where(
        and_(
            ClassDateTime.dateStartTime >= start_time,
            ClassDateTime.dateStartTime < end_time,
            CourseCatalog.courseId == ClassDateTime.courseId,
            Room.courseId == CourseCatalog.courseId,
            CourseStudent.studentId == student_id,
            CourseStudent.courseId == CourseCatalog.courseId,
            Student.studentId == student_id,
            Student.semester == CourseCatalog.semester
        )
    )


# ----------------------------------------------------------------------------
# Student Schedule
# ----------------------------------------------------------------------------

# Gets the day schedule for a student
def getDayStudentSchedule(engine: Engine, student_id: int, date: datetime.date = datetime.datetime.today()):
    """Gets the student's schedule for a given day (default today).

    Args:
        engine (Engine): Engine connection to use.
        student_id (int): Student ID to get schedule for.
        date (datetime.date): Day to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing classes, events, and assignments.
    """
    
    day_start, day_end = _calculate_date_range(date, 'day')

    with engine.connect() as conn:
        # Get student's courses for the day
        courses_query = _get_student_courses_query(student_id, day_start, day_end)
        
        courses = _process_courses_data(conn, courses_query, day_start, day_end)
        events = _get_events_in_range(conn, day_start, day_end)
        assignments = _get_student_assignments_in_range(conn, student_id, day_start, day_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=assignments
    )


# Gets the week schedule for a student
def getWeekStudentSchedule(engine: Engine, student_id: int, date: datetime.date = datetime.datetime.today()):
    """Gets the student's schedule for a given week (default current week).
    Week is considered Monday through Sunday.

    Args:
        engine (Engine): Engine connection to use.
        student_id (int): Student ID to get schedule for.
        date (datetime.date): Any date within the week to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing classes, events, and assignments.
    """
    
    week_start, week_end = _calculate_date_range(date, 'week')

    with engine.connect() as conn:
        # Get student's courses for the week
        courses_query = _get_student_courses_query(student_id, week_start, week_end)
        
        courses = _process_courses_data(conn, courses_query, week_start, week_end)
        events = _get_events_in_range(conn, week_start, week_end)
        assignments = _get_student_assignments_in_range(conn, student_id, week_start, week_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=assignments
    )


# Gets the month schedule for a student
def getMonthStudentSchedule(engine: Engine, student_id: int, date: datetime.date = datetime.datetime.today()):
    """Gets the student's schedule for a given month (default current month).

    Args:
        engine (Engine): Engine connection to use.
        student_id (int): Student ID to get schedule for.
        date (datetime.date): Any date within the month to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing classes, events, and assignments.
    """
    
    month_start, month_end = _calculate_date_range(date, 'month')

    with engine.connect() as conn:
        # Get student's courses for the month
        months_courses = _get_student_courses_query(student_id, month_start, month_end)

        courses = _process_courses_data(conn, months_courses, month_start, month_end)
        events = _get_events_in_range(conn, month_start, month_end)
        assignments = _get_student_assignments_in_range(conn, student_id, month_start, month_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=assignments
    )


# Gets one representative class time for each course in student's semester
def getSemesterStudentSchedule(engine: Engine, student_id: int):
    """Gets one representative class time for each course the student is taking in their current semester.
    Avoids using first or last class times as they often have unusual schedules.

    Args:
        engine (Engine): Engine connection to use.
        student_id (int): Student ID to get schedule for.

    Returns:
        ScheduleModel: Schedule Model containing one class time per course (events and assignments empty).
    """
    
    courses = []

    with engine.connect() as conn:
        # First get the student's current semester
        student_semester = select(Student.semester).where(Student.studentId == student_id)
        semester = conn.execute(student_semester).scalar()
        
        if semester is None:
            return ScheduleModel(Courses=[], Events=[], Assignments=[])

        # Get all courses for this student in their current semester
        semester_courses = select(
            CourseCatalog.courseId,
            CourseCatalog.isBiWeekly
        ).select_from(CourseStudent).join(
            CourseCatalog,
            and_(
                CourseStudent.courseId == CourseCatalog.courseId,
                CourseCatalog.semester == semester
            )
        ).where(
            CourseStudent.studentId == student_id
        )

        # For each course, get a representative class time
        for course_row in conn.execute(semester_courses):
            course_id, is_biweekly = course_row
            
            # Get schedule for course
            course_schedule = getCourseSchedule(engine=engine, course_id=course_id)
            times = course_schedule.ClassTime
            
            # Skip if no class times found
            if not times:
                continue
                
            # Skip first and last class times, pick one from the middle
            if len(times) <= 2:
                # If only 1 or 2 classes, use the first one (can't avoid edge cases here)
                representative_time = times[0]
            else:
                # Pick a time from the middle third of the semester
                start_idx = len(times) // 3
                representative_time = times[start_idx]
            
            # Create the class model

            course_schedule.ClassTime = [representative_time]

            course_model = CourseScheduleModel(
                ClassSchedule=course_schedule,
                isBiWeekly=is_biweekly
            )
            courses.append(course_model)

    # Return schedule model with empty events and assignments
    output = ScheduleModel(
        Courses=courses,
        Events=[],
        Assignments=[]
    )
    return output


# ----------------------------------------------------------------------------
# Teacher Schedule
# ----------------------------------------------------------------------------

def getDayTeacherSchedule(engine: Engine, teacher_id: int, date: datetime.date = datetime.datetime.today()):
    """
    Gets the teacher's schedule for a given day (default current day).

    Args:
        engine (Engine): Engine connection to use.
        teacher_id (int): Teacher ID to get schedule for.
        date (datetime.date): Any date to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing courses and events
    """
    
    day_start, day_end = _calculate_date_range(date, 'day')

    with engine.connect() as conn:
        courses_query = _get_teacher_courses_query(teacher_id, day_start, day_end)
        courses = _process_courses_data(conn, courses_query, day_start, day_end)
        events = _get_events_in_range(conn, day_start, day_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=[]
    )


def getWeekTeacherSchedule(engine: Engine, teacher_id: int, date: datetime.date = datetime.datetime.today()):
    """
    Gets the teacher's schedule for a given week (default current week).
    Week is considered Monday through Sunday.

    Args:
        engine (Engine): Engine connection to use.
        teacher_id (int): Teacher ID to get schedule for.
        date (datetime.date): Any date within the week to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing courses and events
    """
    
    week_start, week_end = _calculate_date_range(date, 'week')

    with engine.connect() as conn:
        courses_query = _get_teacher_courses_query(teacher_id, week_start, week_end)
        courses = _process_courses_data(conn, courses_query, week_start, week_end)
        events = _get_events_in_range(conn, week_start, week_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=[]
    )


def getMonthTeacherSchedule(engine: Engine, teacher_id: int, date: datetime.date = datetime.datetime.today()):
    """
    Gets the teacher's schedule for a given month (default current month).

    Args:
        engine (Engine): Engine connection to use.
        teacher_id (int): Teacher ID to get schedule for.
        date (datetime.date): Any date within the month to get the schedule for.

    Returns:
        ScheduleModel: Schedule Model containing courses and events
    """
    
    month_start, month_end = _calculate_date_range(date, 'month')

    with engine.connect() as conn:
        courses_query = _get_teacher_courses_query(teacher_id, month_start, month_end)
        courses = _process_courses_data(conn, courses_query, month_start, month_end)
        events = _get_events_in_range(conn, month_start, month_end)

    return ScheduleModel(
        Courses=courses,
        Events=events,
        Assignments=[]
    )


# ----------------------------------------------------------------------------
# University Events
# ----------------------------------------------------------------------------


# Get University Events From Today On or From Custom Start Date/Time
def getUniversityEvents(engine: Engine, start_date: datetime.datetime = datetime.datetime.today()):
    """Gets all the events stored in UniversityEvents starting from either today, or custom start.
    
    Note:
    The Date/Start and Date/End of output store a datetime.datetime object. It can be used normally.
    
    Args:
    engine: Engine connection to use.
    start_date: datetime.datetime (Custom start date and time)
    
    Returns:
    output: UniEventScheduleModel
    """
    
    output = []

    # Ensure the date is at 00:00:00
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents).where(UniversityEvents.dateStartTime >= start_date)
        
        for row in conn.execute(event_select):
            event_times = StartEndTimeModel(StartDateTime=row[2], EndDateTime=row[3])
            output.append(EventScheduleModel(EventTime=event_times, EventName=row[1], IsHoliday=row[4]))
            
    return UniEventScheduleModel(Events=output)


# Get All Holidays From University Events From Today or Custom Start
def getHolidays(engine: Engine, start_date: datetime.datetime = None):
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

    # Ensure the date is at 00:00:00
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    with engine.connect() as conn:
        
        event_select = select(UniversityEvents).where(and_(UniversityEvents.isHoliday == True, UniversityEvents.dateStartTime >= start_date))
        
        for row in conn.execute(event_select):
            output.append({"Event ID":row[0], "Event Name":row[1], "Date and Start Time":row[2], "Date and End Time":row[3], "Holiday":row[4]})
            
    return output


# ----------------------------------------------------------------------------
# FAQ
# ----------------------------------------------------------------------------

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


# ----------------------------------------------------------------------------
# User
# ----------------------------------------------------------------------------

# Get User's name
def getName(engine: Engine, role: str, role_id: int) -> str:
    """Get user's name from db.
    
    Args:
        engine: Engine connection to use.
        role: str (Role of the user)
        role_id: int (Role ID of the user)
        
    Returns:
        output: str (User's name)
    """

    role = role.upper()
    sel = None
    if role == "STUDENT":
        sel = select(Student.name).where(Student.studentId == role_id)
    elif role == "TEACHER":
        sel = select(Teacher.name).where(Teacher.teacherId == role_id)
    else:
        return ''
    
    with engine.connect() as conn:
        result = conn.execute(sel).scalar()
        return result if result is not None else ''
    

# Get User's name from user_id
def getNameFromUserId(engine: Engine, user_id: int) -> str:
    """Get user's name from db.
    
    Args:
        engine: Engine connection to use.
        user_id: int (User ID of the user)
        
    Returns:
        output: str (User's name)
    """

    sel = select(User.role, User.roleId).where(User.userId == user_id)
    
    with engine.connect() as conn:
        result = conn.execute(sel).fetchone()
        if result is not None:
            role = str(result[0])
            # Get rid of 'Roles.'
            role = role[6:]
            role_id = result[1]
            return getName(engine=engine, role=role, role_id=role_id)
        return ''


# ----------------------------------------------------------------------------
# Chat
# ----------------------------------------------------------------------------

# Get Chat
def getChats(engine: Engine, user_id: int):
    """Get chats for a user.
    
    Args:
        engine: Engine connection to use.  
        user_id: int (user to get the chats for)
        
    Returns:
        output: ChatModelListModel
    """
    
    output = []

    with engine.connect() as conn:
        chat_select = select(Chat).where(or_(Chat.user1Id == user_id, Chat.user2Id == user_id))
        result = conn.execute(chat_select).fetchall()
        for row in result:
            output.append(ChatModel(chatId=row.chatId, user1Id=row.user1Id, user2Id=row.user2Id))
    return ChatListModel(ChatList=output)
    

# Get Chat Messages
def getChatMessages(engine: Engine, chat_id: int):
    """Get chat messages for a chat.
    
    Args:
        engine: Engine connection to use.  
        chat_id: int (chat id)
        
    Returns:
        output: ChatMessageModel
    """

    output = []

    with engine.connect() as conn:
        chat_message_select = select(ChatMessage).where(ChatMessage.chatId == chat_id)
        result = conn.execute(chat_message_select).fetchall()
        for row in result:
            output.append(ChatMessageModel(chatId=row.chatId, senderName=getNameFromUserId(engine=engine, user_id=row.senderId), message=row.message, timestamp=row.timestamp))
    
    return ChatMessageListModel(ChatMessageList=output)


# Post Chat Message
def postChatMessage(engine: Engine, chat_id: int, sender_id: int, message: str):
    """Post a chat message.
    
    Args:
        engine: Engine connection to use.  
        chat_id: int (chat id)
        sender_id: int (user who sent the message)
        message: str (the message)
        
    Returns:
        output: ChatMessageListModel
    """
    
    with engine.connect() as conn:
        chat_message_insert = insert(ChatMessage).values(chatId=chat_id, senderId=sender_id, message=message, timestamp=datetime.datetime.now())
        conn.execute(chat_message_insert)
        conn.commit()
    
    return getChatMessages(engine=engine, chat_id=chat_id)

# get User ID
def getUserId(engine: Engine, role_id: int, role: str):
    """Get user id from username.
    
    Args:
        engine: Engine connection to use.  
        role_id: int (role id)
        role: str (role)
        
    Returns:
        output: int (user id)
    """
    
    role = role.upper()
    with engine.connect() as conn:
        user_select = select(User.userId).where(User.roleId == role_id, User.role == role)
        result = conn.execute(user_select).scalar()
        return result if result is not None else None

# Test if user is in chat
def TestUserChat(engine: Engine, user_id: int, chat_id: int):
    """Test if user is in chat.
    
    Args:
        engine: Engine connection to use.  
        user_id: int (user id)
        chat_id: int (chat id)
        
    Returns:
        output: bool (True if user is in chat, False otherwise)
    """

    with engine.connect() as conn:
        chat_select = select(Chat).where(Chat.chatId == chat_id)
        result = conn.execute(chat_select).fetchall()
        for row in result:
            if row.user1Id == user_id or row.user2Id == user_id:
                return True
    return False


# Create chat between two users
def createChat(engine: Engine, user1_id: int, user2_id: int):
    """Create a chat between two users.
    
    Args:
        engine: Engine connection to use.  
        user1_id: int (first user in the chat)
        user2_id: int (second user in the chat)
        
    Returns:
        output: id of new chat
    """

    with engine.connect() as conn:
        chat_insert = insert(Chat).values(user1Id=user1_id, user2Id=user2_id)
        conn.execute(chat_insert)
        conn.commit()

        chat_select = select(Chat).where(Chat.user1Id == user1_id, Chat.user2Id == user2_id)
        result = conn.execute(chat_select).scalar()
        return result


# ----------------------------------------------------------------------------
# Course Management
# ----------------------------------------------------------------------------

def getCourseStudents(engine: Engine, course_id: int):
    """Gets all students enrolled in a specific course.
    
    Args:
    engine: Engine connection to use
    course_id: course id to get all students for.
    
    Returns:
    output: CourseStudentsListModel from models.py
    """
    
    try:
        print(f"getCourseStudents: Starting to fetch students for course_id={course_id}")
        with engine.connect() as conn:
            # First check if course exists
            course_exists = select(CourseCatalog).where(CourseCatalog.courseId == course_id)
            course_result = conn.execute(course_exists).first()
            print(f"getCourseStudents: Course exists check result: {course_result}")
            if not course_result:
                print(f"getCourseStudents: Course {course_id} does not exist")
                return CourseStudentsListModel(CourseName="", CourseId=course_id, Students=[])
            
            # Get course name
            course_query = select(CourseCatalog.courseName).where(CourseCatalog.courseId == course_id)
            course_name = conn.execute(course_query).scalar()
            print(f"getCourseStudents: Course name: {course_name}")
            
            # Get all students enrolled in this course with proper JOIN
            students_query = select(
                Student.studentId,
                Student.name,
                Student.email,
                CourseStudent.group
            ).select_from(
                CourseStudent
            ).join(
                Student,
                CourseStudent.studentId == Student.studentId
            ).where(
                CourseStudent.courseId == course_id
            )
            
            print(f"getCourseStudents: Executing students query for course_id={course_id}")
            print(f"getCourseStudents: SQL query: {students_query}")
            students_result = conn.execute(students_query).fetchall()
            print(f"getCourseStudents: Students query result: {students_result}")
            
            students = []
            for student in students_result:
                student_info = StudentCourseInfoModel(
                    student_id=student.studentId,
                    student_name=student.name or f"Student {student.studentId}",
                    student_email=student.email or "",
                    group=student.group
                )
                print(f"getCourseStudents: Created student info: {student_info}")
                students.append(student_info)
            
            result = CourseStudentsListModel(
                CourseName=course_name,
                CourseId=course_id,
                Students=students
            )
            print(f"getCourseStudents: Returning result: {result}")
            return result
            
    except Exception as e:
        print(f"Error in getCourseStudents: {e}")
        import traceback
        traceback.print_exc()
        return CourseStudentsListModel(CourseName="", CourseId=course_id, Students=[])


def getCourseAssignments(engine: Engine, course_id: int):
    """Gets all assignments for a specific course.
    
    Args:
    engine: Engine connection to use
    course_id: course id to get all assignments for.
    
    Returns:
    output: CourseAssignmentsListModel from models.py
    """
    
    try:
        with engine.connect() as conn:
            # First check if course exists
            course_exists = select(CourseCatalog).where(CourseCatalog.courseId == course_id)
            if not conn.execute(course_exists).first():
                return CourseAssignmentsListModel(CourseName="", CourseId=course_id, Assignments=[])
            
            # Get course name
            course_query = select(CourseCatalog.courseName).where(CourseCatalog.courseId == course_id)
            course_name = conn.execute(course_query).scalar()
            
            # Get all assignments for this course
            assignments_query = select(
                Assignment.assignmentId,
                Assignment.name,
                Assignment.desc,
                Assignment.dueDateTime,
                Assignment.needsSubmission,
                Assignment.validFileTypes,
                Assignment.group
            ).where(Assignment.courseId == course_id)
            
            assignments_result = conn.execute(assignments_query).fetchall()
            
            assignments = []
            for assignment in assignments_result:
                assignments.append(AssignmentInfoModel(
                    assignment_id=assignment.assignmentId,
                    assignment_name=assignment.name,
                    desc=assignment.desc,
                    due_date_time=assignment.dueDateTime,
                    needs_submission=assignment.needsSubmission,
                    valid_file_types=assignment.validFileTypes,
                    group=assignment.group
                ))
            
            return CourseAssignmentsListModel(
                CourseName=course_name,
                CourseId=course_id,
                Assignments=assignments
            )
            
    except Exception as e:
        print(f"Error in getCourseAssignments: {e}")
        return CourseAssignmentsListModel(CourseName="", CourseId=course_id, Assignments=[])


def getCourseAssignmentsForStudent(engine: Engine, course_id: int, student_id: int):
    """Gets all assignments for a specific course that are visible to a specific student.
    
    Args:
    engine: Engine connection to use
    course_id: course id to get all assignments for.
    student_id: student id to filter assignments for.
    
    Returns:
    output: CourseAssignmentsListModel from models.py
    """
    
    try:
        with engine.connect() as conn:
            # First check if course exists
            course_exists = select(CourseCatalog).where(CourseCatalog.courseId == course_id)
            if not conn.execute(course_exists).first():
                return CourseAssignmentsListModel(CourseName="", CourseId=course_id, Assignments=[])
            
            # Get course name
            course_query = select(CourseCatalog.courseName).where(CourseCatalog.courseId == course_id)
            course_name = conn.execute(course_query).scalar()
            
            # Get student's group for this course
            student_group_query = select(CourseStudent.group).where(
                and_(CourseStudent.courseId == course_id, CourseStudent.studentId == student_id)
            )
            student_group = conn.execute(student_group_query).scalar()
            
            # Get all assignments for this course that are visible to the student
            # (either no group restriction or matching student's group)
            assignments_query = select(
                Assignment.assignmentId,
                Assignment.name,
                Assignment.desc,
                Assignment.dueDateTime,
                Assignment.needsSubmission,
                Assignment.validFileTypes,
                Assignment.group
            ).where(
                and_(
                    Assignment.courseId == course_id,
                    or_(
                        Assignment.group == None,  # No group restriction
                        Assignment.group == student_group  # Matches student's group
                    )
                )
            )
            
            assignments_result = conn.execute(assignments_query).fetchall()
            
            assignments = []
            for assignment in assignments_result:
                # Pobierz submission dla tego assignmentu i studenta
                submission_query = select(AssignmentSubmission).where(
                    and_(
                        AssignmentSubmission.assignmentId == assignment.assignmentId,
                        AssignmentSubmission.studentId == student_id
                    )
                )
                submission_row = conn.execute(submission_query).fetchone()
                if submission_row and submission_row.submission is not None:
                    submitted_link = submission_row.submission
                    submitted_comment = None  # Jeśli chcesz obsłużyć komentarz, dodaj pole w bazie
                    submission_status = 'Submitted'
                else:
                    submitted_link = None
                    submitted_comment = None
                    submission_status = 'Not Submitted'
                assignments.append(AssignmentInfoModel(
                    assignment_id=assignment.assignmentId,
                    assignment_name=assignment.name,
                    desc=assignment.desc,
                    due_date_time=assignment.dueDateTime,
                    needs_submission=assignment.needsSubmission,
                    valid_file_types=assignment.validFileTypes,
                    group=assignment.group,
                    submitted_link=submitted_link,
                    submitted_comment=submitted_comment,
                    submission_status=submission_status
                ))
            
            return CourseAssignmentsListModel(
                CourseName=course_name,
                CourseId=course_id,
                Assignments=assignments
            )
            
    except Exception as e:
        print(f"Error in getCourseAssignmentsForStudent: {e}")
        return CourseAssignmentsListModel(CourseName="", CourseId=course_id, Assignments=[])


def getCourseScheduleView(engine: Engine, course_id: int):
    """Gets the schedule view for a specific course.
    
    Args:
        engine (Engine): Engine connection to use.
        course_id (int): Course ID to get schedule for.

    Returns:
        CourseScheduleViewModel: Course Schedule View with group information.
    """
    
    try:
        with engine.connect() as conn:
            # Get course info with LEFT JOIN to handle cases where Room might not exist
            course_info_sel = select(
                CourseCatalog.courseName,
                CourseCatalog.isBiWeekly,
                Room.building,
                Room.roomNumber
            ).select_from(
                CourseCatalog
            ).outerjoin(
                Room,
                CourseCatalog.courseId == Room.courseId
            ).where(
                CourseCatalog.courseId == course_id
            )

            course_info = conn.execute(course_info_sel).fetchone()

            if course_info is None:
                return CourseScheduleViewModel(
                    CourseName="",
                    CourseId=course_id,
                    Building=None,
                    RoomNumber=None,
                    isBiWeekly=False,
                    Groups=[]
                )

            course_name, is_biweekly, building, room_number = course_info

            # Get all class times for the course
            class_times = select(
                ClassDateTime.dateStartTime,
                ClassDateTime.endTime
            ).where(
                ClassDateTime.courseId == course_id
            ).order_by(
                ClassDateTime.dateStartTime
            )

            class_times = conn.execute(class_times).fetchall()
            
            # Create groups based on unique days and times
            groups = []
            seen_times = set()
            
            for date_start_time, end_time in class_times:
                # Create a unique key for this time slot
                time_key = (date_start_time.strftime('%A'), date_start_time.time(), end_time)
                
                if time_key not in seen_times:
                    seen_times.add(time_key)
                    groups.append(CourseGroupScheduleModel(
                        GroupNumber=len(groups) + 1,  # Assign sequential group numbers
                        DayOfWeek=date_start_time.strftime('%A'),
                        StartTime=date_start_time.time(),
                        EndTime=end_time
                    ))

            # Create the course schedule view model with all required fields
            return CourseScheduleViewModel(
                CourseName=course_name,
                CourseId=course_id,
                Building=building,
                RoomNumber=room_number,
                isBiWeekly=is_biweekly,
                Groups=groups
            )
    
    except Exception as e:
        print(f"Error in getCourseScheduleView: {e}")
        return CourseScheduleViewModel(
            CourseName="",
            CourseId=course_id,
            Building=None,
            RoomNumber=None,
            isBiWeekly=False,
            Groups=[]
        )
    

def postAssignmentSubmission(engine, model):
    """Posts or updates an assignment submission for a student."""
    from sqlalchemy import select, insert, update, func, and_
    from Database import Assignment, AssignmentSubmission, CourseStudent
    with engine.connect() as conn:
        # Check if assignment exists
        assignment_exists = select(Assignment).where(Assignment.assignmentId == model.assignment_id)
        if conn.execute(assignment_exists).fetchone() is None:
            return {"status_code": 404, "detail": "Assignment does not exist"}
        # Check if student is in the course
        # Get course_id from assignment
        course_id_query = select(Assignment.courseId).where(Assignment.assignmentId == model.assignment_id)
        course_id = conn.execute(course_id_query).scalar()
        student_in_course = select(CourseStudent).where(and_(CourseStudent.studentId == model.student_id, CourseStudent.courseId == course_id))
        if conn.execute(student_in_course).fetchone() is None:
            return {"status_code": 403, "detail": "Student is not in the course"}
        # Check if submission already exists
        submission_exists = select(AssignmentSubmission).where(and_(AssignmentSubmission.assignmentId == model.assignment_id, AssignmentSubmission.studentId == model.student_id))
        row = conn.execute(submission_exists).fetchone()
        import datetime
        now = datetime.datetime.now()
        if row is not None:
            # Update existing submission
            submission_update = update(AssignmentSubmission).where(and_(AssignmentSubmission.assignmentId == model.assignment_id, AssignmentSubmission.studentId == model.student_id)).values(submission=model.submission_link, submissionDateTime=now)
            conn.execute(submission_update)
            conn.commit()
            return {"status_code": 200, "detail": "Submission updated successfully"}
        else:
            # Insert new submission
            max_id_query = select(func.max(AssignmentSubmission.assignmentSubmissionId))
            max_id = conn.execute(max_id_query).scalar() or 0
            submission_insert = insert(AssignmentSubmission).values(
                assignmentSubmissionId=max_id + 1,
                assignmentId=model.assignment_id,
                studentId=model.student_id,
                submissionDateTime=now,
                submission=model.submission_link
            )
            conn.execute(submission_insert)
            conn.commit()
            return {"status_code": 200, "detail": "Submission posted successfully"}
    
def getUserProfile(engine: Engine, user_id: int):
    """Gets the profile information for a given user ID."""
    with engine.connect() as conn:
        user_query = select(User.role, User.roleId).where(User.userId == user_id)
        user_result = conn.execute(user_query).fetchone()

        if not user_result:
            return None

        role_enum, role_id = user_result
        role = str(role_enum).split('.')[-1].lower()

        profile_data = {
            "name": "",
            "email": "",
            "roleId": role_id,
            "role": role,
            "title": None,
            "semester": None,
        }

        if role == "student":
            student_query = select(Student.name, Student.email, Student.semester).where(Student.studentId == role_id)
            student_result = conn.execute(student_query).fetchone()
            if student_result:
                profile_data["name"] = student_result.name
                profile_data["email"] = student_result.email
                profile_data["semester"] = student_result.semester
        elif role == "teacher":
            teacher_query = select(Teacher.name, Teacher.email, Teacher.title).where(Teacher.teacherId == role_id)
            teacher_result = conn.execute(teacher_query).fetchone()
            if teacher_result:
                profile_data["name"] = teacher_result.name
                profile_data["email"] = teacher_result.email
                profile_data["title"] = teacher_result.title
        
        return profile_data

def getAssignmentSubmissions(engine: Engine, course_id: int, assignment_id: int):
    """Gets all submissions for a specific assignment.
    
    Args:
    engine: Engine connection to use
    course_id: course id
    assignment_id: assignment id to get submissions for
    
    Returns:
    dictionary with submissions list
    """
    
    try:
        with engine.connect() as conn:
            # Check if assignment exists and belongs to the course
            assignment_exists = select(Assignment).where(
                and_(
                    Assignment.assignmentId == assignment_id,
                    Assignment.courseId == course_id
                )
            )
            if not conn.execute(assignment_exists).first():
                return {"status_code": 404, "detail": "Assignment not found in this course"}
            
            # Get all submissions for this assignment with student information
            submissions_query = select(
                Student.studentId,
                Student.name,
                Student.email,
                AssignmentSubmission.submission,
                AssignmentSubmission.submissionDateTime,
                Grade.grade
            ).select_from(
                AssignmentSubmission
            ).join(
                Student,
                AssignmentSubmission.studentId == Student.studentId
            ).outerjoin(
                Grade,
                and_(
                    Grade.studentId == AssignmentSubmission.studentId,
                    Grade.assignmentId == assignment_id
                )
            ).where(
                AssignmentSubmission.assignmentId == assignment_id
            )
            
            submissions_result = conn.execute(submissions_query).fetchall()
            
            submissions = []
            for submission in submissions_result:
                # Extract submission link and comment from submission field
                submission_data = submission.submission or ""
                submission_link = None
                submission_comment = None
                
                # Simple parsing - assume format "link|comment" or just "link"
                if "|" in submission_data:
                    parts = submission_data.split("|", 1)
                    submission_link = parts[0].strip()
                    submission_comment = parts[1].strip() if len(parts) > 1 else None
                else:
                    submission_link = submission_data.strip() if submission_data else None
                
                submissions.append({
                    "student_id": submission.studentId,
                    "student_name": submission.name or f"Student {submission.studentId}",
                    "student_email": submission.email or "",
                    "submission_link": submission_link,
                    "submission_comment": submission_comment,
                    "submission_datetime": submission.submissionDateTime,
                    "grade": submission.grade
                })
            
            return {
                "status_code": 200,
                "submissions": submissions
            }
            
    except Exception as e:
        print(f"Error in getAssignmentSubmissions: {e}")
        return {"status_code": 500, "detail": f"Internal server error: {str(e)}"}

def deleteCourse(engine: Engine, teacher_id: int, course_id: int):
    """Deletes a course and all associated data (grades, enrollments, rooms, assignments, submissions).
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id who is attempting to delete the course
    course_id: course id to delete
    
    Returns:
    dictionary with status_code and detail
    """
    
    try:
        with engine.connect() as conn:
            # Check if teacher is assigned to this course
            teacher_teaching = select(CourseTeacher).where(
                and_(
                    CourseTeacher.courseId == course_id,
                    CourseTeacher.teacherId == teacher_id
                )
            )
            teacher_result = conn.execute(teacher_teaching).fetchone()
            if teacher_result is None:
                return {"status_code": 403, "detail": "Teacher is not assigned to this course"}
            
            # Check if course exists
            course_exists = select(CourseCatalog).where(CourseCatalog.courseId == course_id)
            if not conn.execute(course_exists).fetchone():
                return {"status_code": 404, "detail": "Course does not exist"}
            
            # Delete assignment submissions for this course
            submissions_delete = delete(AssignmentSubmission).where(
                AssignmentSubmission.assignmentId.in_(
                    select(Assignment.assignmentId).where(Assignment.courseId == course_id)
                )
            )
            conn.execute(submissions_delete)
            
            # Delete grades for assignments in this course
            grades_delete = delete(Grade).where(
                Grade.assignmentId.in_(
                    select(Assignment.assignmentId).where(Assignment.courseId == course_id)
                )
            )
            conn.execute(grades_delete)
            
            # Delete assignments for this course
            assignments_delete = delete(Assignment).where(Assignment.courseId == course_id)
            conn.execute(assignments_delete)
            
            # Delete class times for this course
            class_times_delete = delete(ClassDateTime).where(ClassDateTime.courseId == course_id)
            conn.execute(class_times_delete)
            
            # Delete rooms for this course
            rooms_delete = delete(Room).where(Room.courseId == course_id)
            conn.execute(rooms_delete)
            
            # Delete course-student associations
            course_students_delete = delete(CourseStudent).where(CourseStudent.courseId == course_id)
            conn.execute(course_students_delete)
            
            # Delete course-teacher associations
            course_teachers_delete = delete(CourseTeacher).where(CourseTeacher.courseId == course_id)
            conn.execute(course_teachers_delete)
            
            # Finally delete the course itself
            course_delete = delete(CourseCatalog).where(CourseCatalog.courseId == course_id)
            conn.execute(course_delete)
            
            # Commit all changes
            conn.commit()
            
            return {"status_code": 200, "detail": "Course deleted successfully"}
            
    except Exception as e:
        print(f"Error in deleteCourse: {e}")
        return {"status_code": 500, "detail": f"Internal server error: {str(e)}"}

def deleteAssignment(engine: Engine, teacher_id: int, assignment_id: int):
    """Deletes an assignment and all associated data (submissions, grades).
    
    Args:
    engine: Engine connection to use
    teacher_id: teacher id who is attempting to delete the assignment
    assignment_id: assignment id to delete
    
    Returns:
    dictionary with status_code and detail
    """
    
    try:
        with engine.connect() as conn:
            # Check if assignment exists
            assignment_exists = select(Assignment).where(Assignment.assignmentId == assignment_id)
            assignment_result = conn.execute(assignment_exists).fetchone()
            if not assignment_result:
                return {"status_code": 404, "detail": "Assignment does not exist"}
            
            # Get course_id from assignment
            course_id = assignment_result.courseId
            
            # Check if teacher is assigned to this course
            teacher_teaching = select(CourseTeacher).where(
                and_(
                    CourseTeacher.courseId == course_id,
                    CourseTeacher.teacherId == teacher_id
                )
            )
            teacher_result = conn.execute(teacher_teaching).fetchone()
            if teacher_result is None:
                return {"status_code": 403, "detail": "Teacher is not assigned to this course"}
            
            # Delete assignment submissions for this assignment
            submissions_delete = delete(AssignmentSubmission).where(
                AssignmentSubmission.assignmentId == assignment_id
            )
            conn.execute(submissions_delete)
            
            # Delete grades for this assignment
            grades_delete = delete(Grade).where(Grade.assignmentId == assignment_id)
            conn.execute(grades_delete)
            
            # Finally delete the assignment itself
            assignment_delete = delete(Assignment).where(Assignment.assignmentId == assignment_id)
            conn.execute(assignment_delete)
            
            # Commit all changes
            conn.commit()
            
            return {"status_code": 200, "detail": "Assignment deleted successfully"}
            
    except Exception as e:
        print(f"Error in deleteAssignment: {e}")
        return {"status_code": 500, "detail": f"Internal server error: {str(e)}"}