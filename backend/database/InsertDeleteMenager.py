from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import IntegrityError
from database.database_I import Base,Grade, Student, CourseCatalog, Teacher, Degree, Room, CourseTeacher, CourseStudent
# Remove Grade import if not in database_I.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column   
from datetime import datetime, timedelta

class DatabaseManager:
    def __init__(self, engine):
        self.engine = engine
        self.Session = sessionmaker(bind=engine)

    # ----------- Adding Records -----------

    def add_student(self, student_id, email=None, hashed_password=None, semester=1, year=1, degree_id=0, age=None):
        with self.Session() as session:
            student = Student(
            studentId=student_id,
            email=email,
            hashed_password=hashed_password,
            semester=semester,
            year=year,
            degreeId=degree_id,
            age=age
        )
        session.add(student)
        session.commit()

    def add_course(self, course_id, course_name, teacher_id=None, semester=1, year=1, ects=1):
        # Add a new course to the catalog
        with self.Session() as session:
            course = CourseCatalog(
                courseId=course_id,
                courseName=course_name,
                teacherId=teacher_id,
                semester=semester,
                year=year,
                ects=ects
            )
            session.add(course)
            session.commit()

    def add_teacher(self, teacher_id, name=None, email=None, hashed_password=None, title=None):
  
        with self.Session() as session:
            teacher = Teacher(
            teacherId=teacher_id,
            name=name,
            email=email,
            hashed_password=hashed_password,
            title=title
        )
        session.add(teacher)
        session.commit()

    def add_degree(self, degree_id, name=None):
        # Add a new degree program
        with self.Session() as session:
            degree = Degree(
                degreeId=degree_id,
                name=name
            )
            session.add(degree)
            session.commit()

    def add_room(self, room_id, course_id, building, room_number):
        # Assign a room to a course
        with self.Session() as session:
            room = Room(
                id=room_id,
                courseId=course_id,
                building=building,
                roomNumber=room_number
            )
            session.add(room)
            session.commit()

    def add_course_teacher(self, ct_id, course_id, teacher_id):
        # Add a teacher-course association
        with self.Session() as session:
            ct = CourseTeacher(
                id=ct_id,
                courseId=course_id,
                teacherId=teacher_id
            )
            session.add(ct)
            session.commit()

    def add_course_student(self, key, course_id, student_id):
        # Enroll a student in a course
        with self.Session() as session:
            cs = CourseStudent(
                key=key,
                courseId=course_id,
                studentId=student_id
            )
            session.add(cs)
            session.commit()

    def add_grade(self, grade_id, key, grade_value):
        # Add a grade for a student in a course
        with self.Session() as session:
            grade = Grade(
                id=grade_id,
                key=key,
                grade=grade_value
            )
            session.add(grade)
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
        
    def record_login_attempt(self, user_id, role, is_successful, ip_address=None):
        """Record a login attempt"""
        with self.Session() as session:
            attempt = LoginAttempts(
                user_id=user_id,
                role=role,
                is_successful=is_successful,
                ip_address=ip_address
            )
            session.add(attempt)
            session.commit()

    def get_failed_attempts(self, user_id, role, minutes=15):
        """Get failed login attempts in the last X minutes"""
        with self.Session() as session:
            cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
            return session.query(LoginAttempts).filter(
                LoginAttempts.user_id == user_id,
                LoginAttempts.role == role,
                LoginAttempts.is_successful == False,
                LoginAttempts.attempt_time > cutoff_time
            ).count()

    def is_account_locked(self, user_id, role):
        """Check if account is locked due to too many failed attempts"""
        failed_attempts = self.get_failed_attempts(user_id, role)
        return failed_attempts >= 5

    def get_student_info(self, student_id):
        with self.Session() as session:
            return session.get(Student, student_id)

    def get_teacher_info(self, teacher_id):
        with self.Session() as session:
            return session.get(Teacher, teacher_id)

    def add_student(self, student_id, email=None, hashed_password=None, **kwargs):
        with self.Session() as session:
            student = Student(
                studentId=student_id,
                email=email,
                hashed_password=hashed_password,
                **kwargs
            )
            session.add(student)
            session.commit()

    def add_teacher(self, teacher_id, name=None, email=None, hashed_password=None, **kwargs):
        with self.Session() as session:
            teacher = Teacher(
                teacherId=teacher_id,
                name=name,
                email=email,
                hashed_password=hashed_password,
                **kwargs
            )
            session.add(teacher)
            session.commit() 