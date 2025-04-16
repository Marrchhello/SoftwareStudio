from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import IntegrityError

class DatabaseManager:
    def __init__(self, engine):
        self.engine = engine
        self.Session = sessionmaker(bind=engine)

    # ----------- Adding Records -----------

    def add_student(self, student_id, semester=1, year=1, degree_id=0, age=None, email=None):
        # Add a new student to the database
        with self.Session() as session:
            student = Student(
                studentId=student_id,
                semester=semester,
                year=year,
                degreeId=degree_id,
                age=age,
                email=email
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

    def add_teacher(self, teacher_id, name=None, title=None, email=None):
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
