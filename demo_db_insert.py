import datetime, pytz, sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from database_I import *

# Demo for inserting data into the database. First insert is minimum required fields. Second insert is maximum fields.
# Warning. When inserting, be aware of foreign key restraints. The key (field in another table) must exists before insert.
# This particular order works.

try:
    
    engine = create_engine('postgresql+psycopg://postgres:password@localhost/postgres')
    with engine.connect() as conn:
        
        print("Connected to Database!")
        Base.metadata.create_all(engine)
        print()        
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        addlist = []
        
        # Course Catalog
        addlist.append(CourseCatalog(courseId=0, courseName='Prog'))
        addlist.append(CourseCatalog(courseId=1, courseName='Optimization', semester=4, ects=5))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Degree
        addlist.append(Degree(degreeId=0))
        addlist.append(Degree(degreeId=1, name='Computer Science', numSemesters=7))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Teacher
        addlist.append(Teacher(teacherId=0))
        addlist.append(Teacher(teacherId=1, name='Rick Astley', title='Mr Dr Prof', email='rick@roll.lol'))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Class Date Time
        addlist.append(ClassDateTime(classDateTimeId=1, courseId=0, dateStartTime=datetime.datetime(year=2026, month=12, day=25, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=2, courseId=1, dateStartTime=datetime.datetime(year=2025, month=5, day=19, hour=11, minute=15, second=0, microsecond=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(14, 45)))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Student
        addlist.append(Student(studentId=0))
        addlist.append(Student(studentId=1, semester=4, degreeId=1, age=22, email='roll@rick.lel'))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Room
        addlist.append(Room(roomId=0, courseId=0))
        addlist.append(Room(roomId=1, courseId=1, building='B5', roomNumber=405))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Course Teacher
        addlist.append(CourseTeacher(courseTeacherId=0, courseId=0))
        addlist.append(CourseTeacher(courseTeacherId=1, courseId=1, teacherId=1))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Assignment
        addlist.append(Assignment(assignmentId=0, name='Hello World', courseId=0))
        addlist.append(Assignment(assignmentId=1, name='Goodbye World', courseId=1, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=8, tzinfo=pytz.timezone('Europe/Warsaw')), needsSubmission=True, assignmentIntro='Make Hello World in Assembly', group=1, validFileTypes='txt'))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Grade
        addlist.append(Grade(gradeId=0, studentId=0))
        addlist.append(Grade(gradeId=1, studentId=1, grade=5.0, assignmentId=1))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Course Student
        addlist.append(CourseStudent(courseStudentId=0, courseId=0, studentId=0))
        addlist.append(CourseStudent(courseStudentId=1, courseId=1, studentId=1, group=1))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
except sqlalchemy.exc.OperationalError:
    print("Login failed. Invalid username or password.")
    print()