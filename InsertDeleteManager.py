from sqlalchemy import create_engine, ForeignKey, select, engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import IntegrityError
from database_I import *
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column   
import datetime as dt


class DatabaseManager:
    def __init__(self, engine: Engine):
        self.engine = engine
        self.Session = sessionmaker(bind=engine)

    # ----------- Adding Records -----------

    def add_student(self, student_id: int, semester: int = None, degree_id: int = None, age: int = None, email: str = None):
        # Add a new student to the database
        with self.Session() as session:
            student = Student(
                studentId=student_id,
                semester=semester,
                degreeId=degree_id,
                age=age,
                email=email
            )
            session.add(student)
            session.commit()

    def add_course(self, course_id: int, course_name: str, semester: int = None, ects: int = None):
        # Add a new course to the catalog
        with self.Session() as session:
            course = CourseCatalog(
                courseId=course_id,
                courseName=course_name,
                semester=semester,
                ects=ects
            )
            session.add(course)
            session.commit()

    def add_teacher(self, teacher_id: int, name: str = None, title: str = None, email: str = None):
        # Add a new teacher to the system
        with self.Session() as session:
            teacher = Teacher(
                teacherId=teacher_id,
                name=name,
                title=title,
                email=email
            )
            session.add(teacher)
            session.commit()

    def add_degree(self, degree_id: int, name: str = None, numSemesters: int = None):
        # Add a new degree program
        with self.Session() as session:
            degree = Degree(
                degreeId=degree_id,
                name=name,
                numSemesters=numSemesters
            )
            session.add(degree)
            session.commit()

    def add_room(self, room_id: int, course_id: int, building: str = None, room_number: int = None):
        # Assign a room to a course
        with self.Session() as session:
            room = Room(
                roomId=room_id,
                courseId=course_id,
                building=building,
                roomNumber=room_number
            )
            session.add(room)
            session.commit()

    def add_course_teacher(self, ct_id: int, course_id: int, teacher_id: int = None):
        # Add a teacher-course association
        with self.Session() as session:
            ct = CourseTeacher(
                courseTeacherId=ct_id,
                courseId=course_id,
                teacherId=teacher_id
            )
            session.add(ct)
            session.commit()

    def add_course_student(self, cs_id: int, course_id: int, student_id: int, group: int = None):
        # Enroll a student in a course
        with self.Session() as session:
            cs = CourseStudent(
                courseStudentId=cs_id,
                courseId=course_id,
                studentId=student_id,
                group=group
            )
            session.add(cs)
            session.commit()

    def add_grade(self, grade_id: int, student_id: int, assignment_id: int, grade_value: float = None):
        # Add a grade for a student in a course
        with self.Session() as session:
            grade = Grade(
                gradeId=grade_id,
                studentId=student_id,
                grade=grade_value,
                assignmentId=assignment_id
            )
            session.add(grade)
            session.commit()
            
    def add_class_time(self, cdt_id: int, course_id: int, date_and_start_time: dt.datetime = None, end_time: dt.time = None):
        # schedule a time for a class
        with self.Session() as session:
            class_time = ClassDateTime(
                classDateTimeId=cdt_id,
                courseId=course_id,
                dateStartTime=date_and_start_time,
                endTime=end_time
            )
            session.add(class_time)
            session.commit()
            
    def add_assignment(self, assignment_id: int, course_id: int, assignment_name: str, 
                       due_date_time: dt.datetime = None, needs_submission: bool = None,
                       desc: str = None, file_types: str = None, group: int = None):
        # Add an assignment to a course
        with self.Session() as session:
            asgnmnt = Assignment(
                assignmentId=assignment_id,
                name=assignment_name,
                dueDateTime=due_date_time,
                needsSubmission=needs_submission,
                assignmentIntro=desc,
                validFileTypes=file_types,
                group=group,
                courseId=course_id
            )
            session.add(asgnmnt)
            session.commit()
            
            
    def add_university_event(self, eventId: int, eventName: str, dateStartTime: dt.datetime, dateEndTime: dt.datetime, isHoliday: bool = False):
        # Add a university wide event
        event = UniversityEvents(eventId=eventId, 
                                 eventName=eventName, 
                                 dateStartTime=dateStartTime,
                                 dateEndTime=dateEndTime,
                                 isHoliday=isHoliday)
        session.add(event)
        session.commit()
        
    
    def add_staff(self, staffId: int, name: str, email: str = None, administrator: bool = False):
        # Add a staff member
        staff = Staff(staffId=staffId, 
                      name=name, 
                      email=email, 
                      administrator=administrator)
        session.add(staff)
        session.commit()

    # ----------- Deleting Records -----------

    def delete_student(self, student_id):
        # Delete a student and all related course enrollments and grades
        with self.Session() as session:
            course_students = session.query(CourseStudent).filter(CourseStudent.studentId == student_id).all()
            keys = [cs.key for cs in course_students]

            # Delete related grades
            if keys:
                session.query(Grade).filter(Grade.key.in_(keys)).delete(synchronize_session=False)

            # Delete course-student associations
            session.query(CourseStudent).filter(CourseStudent.studentId == student_id).delete(synchronize_session=False)

            # Delete the student
            session.query(Student).filter(Student.studentId == student_id).delete(synchronize_session=False)
            session.commit()

    def delete_course(self, course_id):
        # Delete a course and all associated data (grades, enrollments, rooms, assignments)
        with self.Session() as session:
            course_students = session.query(CourseStudent).filter(CourseStudent.courseId == course_id).all()
            keys = [cs.key for cs in course_students]

            # Delete related grades
            if keys:
                session.query(Grade).filter(Grade.key.in_(keys)).delete(synchronize_session=False)

            # Delete enrollments and course-teacher associations
            session.query(CourseStudent).filter(CourseStudent.courseId == course_id).delete(synchronize_session=False)
            session.query(CourseTeacher).filter(CourseTeacher.courseId == course_id).delete(synchronize_session=False)

            # Delete associated rooms
            session.query(Room).filter(Room.courseId == course_id).delete(synchronize_session=False)

            # Delete the course
            session.query(CourseCatalog).filter(CourseCatalog.courseId == course_id).delete(synchronize_session=False)
            session.commit()

    def delete_teacher(self, teacher_id):
        # Delete a teacher and remove their associations
        with self.Session() as session:
            # Set teacherId to NULL in courses where they are assigned
            session.query(CourseCatalog).filter(CourseCatalog.teacherId == teacher_id).update(
                {CourseCatalog.teacherId: None}, 
                synchronize_session=False
            )

            # Delete course-teacher links
            session.query(CourseTeacher).filter(CourseTeacher.teacherId == teacher_id).delete(synchronize_session=False)

            # Delete the teacher
            session.query(Teacher).filter(Teacher.teacherId == teacher_id).delete(synchronize_session=False)
            session.commit()

    def delete_degree(self, degree_id):
        # Delete a degree program
        with self.Session() as session:
            session.query(Degree).filter(Degree.degreeId == degree_id).delete(synchronize_session=False)
            session.commit()

    def delete_room(self, room_id):
        # Delete a room record
        with self.Session() as session:
            session.query(Room).filter(Room.id == room_id).delete(synchronize_session=False)
            session.commit()

    def delete_course_teacher(self, ct_id):
        # Delete a course-teacher association
        with self.Session() as session:
            session.query(CourseTeacher).filter(CourseTeacher.id == ct_id).delete(synchronize_session=False)
            session.commit()

    def delete_course_student(self, key):
        # Delete a student's enrollment and grade in a course
        with self.Session() as session:
            session.query(Grade).filter(Grade.key == key).delete(synchronize_session=False)
            session.query(CourseStudent).filter(CourseStudent.key == key).delete(synchronize_session=False)
            session.commit()

    def delete_grade(self, grade_id):
        # Delete a grade record
        with self.Session() as session:
            session.query(Grade).filter(Grade.id == grade_id).delete(synchronize_session=False)
            session.commit()

    # ----------- Role-Based Access Methods -----------

    def get_student_info(self, student_id):
        """Student can view their own information"""
        with self.Session() as session:
            return session.query(Student).filter(Student.studentId == student_id).first()

    def get_student_courses(self, student_id):
        """Student can view their enrolled courses"""
        with self.Session() as session:
            return (session.query(CourseCatalog)
                   .join(CourseStudent, CourseStudent.courseId == CourseCatalog.courseId)
                   .filter(CourseStudent.studentId == student_id)
                   .all())

    def get_student_grades(self, student_id):
        """Student can view their own grades"""
        with self.Session() as session:
            return (session.query(Grade, CourseCatalog.courseName)
                   .join(CourseStudent, CourseStudent.key == Grade.key)
                   .join(CourseCatalog, CourseCatalog.courseId == CourseStudent.courseId)
                   .filter(CourseStudent.studentId == student_id)
                   .all())

    def get_teacher_courses(self, teacher_id):
        """Teacher can view their assigned courses"""
        with self.Session() as session:
            return (session.query(CourseCatalog)
                   .filter(CourseCatalog.teacherId == teacher_id)
                   .all())

    def get_teacher_students(self, teacher_id):
        """Teacher can view students in their courses"""
        with self.Session() as session:
            return (session.query(Student)
                   .join(CourseStudent, CourseStudent.studentId == Student.studentId)
                   .join(CourseCatalog, CourseCatalog.courseId == CourseStudent.courseId)
                   .filter(CourseCatalog.teacherId == teacher_id)
                   .distinct()
                   .all())

    def get_teacher_course_students(self, teacher_id, course_id):
        """Teacher can view students and grades for a specific course"""
        with self.Session() as session:
            return (session.query(Student, Grade)
                   .join(CourseStudent, CourseStudent.studentId == Student.studentId)
                   .join(CourseCatalog, CourseCatalog.courseId == CourseStudent.courseId)
                   .outerjoin(Grade, Grade.key == CourseStudent.key)
                   .filter(CourseCatalog.teacherId == teacher_id)
                   .filter(CourseCatalog.courseId == course_id)
                   .all())
        

    def register_user(self, role, user_id, **kwargs):
        """
        Register a user as a 'student' or 'teacher'.
        kwargs can include name, title, email, semester, year, etc.
        """
        with self.Session() as session:
            try:
                if role == 'student':
                    student = Student(
                        studentId=user_id,
                        semester=kwargs.get('semester', 1),
                        year=kwargs.get('year', 1),
                        degreeId=kwargs.get('degreeId', 0),
                        age=kwargs.get('age'),
                        email=kwargs.get('email')
                    )
                    session.add(student)
                elif role == 'teacher':
                    teacher = Teacher(
                        teacherId=user_id,
                        name=kwargs.get('name'),
                        title=kwargs.get('title'),
                        email=kwargs.get('email')
                    )
                    session.add(teacher)
                else:
                    raise ValueError("Role must be either 'student' or 'teacher'")
                session.commit()
                print(f"{role.capitalize()} registered successfully!")
            except IntegrityError:
                session.rollback()
                print(f"{role.capitalize()} with ID {user_id} already exists.")

    # ----------- New: Login -----------

    def login_user(self, user_id):
        """
        Login a user by ID. Detects automatically whether the user is a student or a teacher.
        """
        with self.Session() as session:
            student = session.get(Student, user_id)
            if student:
                print(f"Student logged in: ID={student.studentId}")
                return 'student', student

            teacher = session.get(Teacher, user_id)
            if teacher:
                print(f"Teacher logged in: ID={teacher.teacherId}")
                return 'teacher', teacher

            print("User not found.")
            return None, None