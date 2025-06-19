import datetime, pytz, sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from backend.Database import *
from sqlalchemy import create_engine

# Demo for inserting data into the database. First insert is minimum required fields. Second insert is maximum fields.
# Warning. When inserting, be aware of foreign key restraints. The key (field in another table) must exists before insert.
# This particular order works.

try:
    
    engine = create_engine('postgresql+psycopg://postgres:password@SS_Database:5432/postgres')
    with engine.connect() as conn:
        
        print("Connected to Database!")
        Base.metadata.create_all(engine)
        print()        
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        addlist = []
        
        # Course Catalog
        addlist.append(CourseCatalog(courseId=0, courseName='Prog', isBiWeekly=True))
        addlist.append(CourseCatalog(courseId=1, courseName='Optimization', semester=4, ects=5, isBiWeekly=False))
        addlist.append(CourseCatalog(courseId=2, courseName='Engrish', semester=3, ects=3, isBiWeekly=True))
        addlist.append(CourseCatalog(courseId=3, courseName='Javanese', semester=2, ects=4, isBiWeekly=False))
        
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
        addlist.append(ClassDateTime(classDateTimeId=0, courseId=0, dateStartTime=datetime.datetime(year=2025, month=12, day=20, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=1, courseId=0, dateStartTime=datetime.datetime(year=2025, month=12, day=25, hour=11, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(11, 30)))
        addlist.append(ClassDateTime(classDateTimeId=2, courseId=1, dateStartTime=datetime.datetime(year=2025, month=5, day=9, hour=9, minute=51), endTime=datetime.time(hour=14, minute=45)))
        addlist.append(ClassDateTime(classDateTimeId=3, courseId=2, dateStartTime=datetime.datetime(year=2025, month=12, day=25, hour=12, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(13, 30)))
        addlist.append(ClassDateTime(classDateTimeId=4, courseId=2, dateStartTime=datetime.datetime(year=2025, month=11, day=25, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=5, courseId=3, dateStartTime=datetime.datetime(year=2025, month=12, day=25, hour=14, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(15, 30)))
        addlist.append(ClassDateTime(classDateTimeId=6, courseId=3, dateStartTime=datetime.datetime(year=2025, month=10, day=25, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=7, courseId=1, dateStartTime=datetime.datetime(year=2025, month=9, day=25, hour=10, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(11, 30)))
        addlist.append(ClassDateTime(classDateTimeId=8, courseId=1, dateStartTime=datetime.datetime(year=2025, month=7, day=25, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=9, courseId=1, dateStartTime=datetime.datetime(year=2025, month=7, day=25, hour=12, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(13, 30)))
        addlist.append(ClassDateTime(classDateTimeId=10, courseId=2, dateStartTime=datetime.datetime(year=2025, month=6, day=25, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=11, courseId=2, dateStartTime=datetime.datetime(year=2025, month=5, day=25, hour=10, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(11, 30)))
        addlist.append(ClassDateTime(classDateTimeId=12, courseId=3, dateStartTime=datetime.datetime(year=2025, month=5, day=25, hour=15, minute=0), endTime=datetime.time(hour=16, minute=30)))
        addlist.append(ClassDateTime(classDateTimeId=13, courseId=3, dateStartTime=datetime.datetime(year=2025, month=5, day=25, hour=10, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(11, 30)))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Student
        addlist.append(Student(studentId=0))
        addlist.append(Student(studentId=1, semester=4, degreeId=1, name='ben', age=22, email='roll@rick.lel'))
        
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
        addlist.append(CourseTeacher(courseTeacherId=2, courseId=2, teacherId=1))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Assignment
        addlist.append(Assignment(assignmentId=0, name='Hello World', courseId=0, needsSubmission=True))
        addlist.append(Assignment(assignmentId=1, name='Goodbye World', desc='Make Hello World in Assembly', courseId=1, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=8, tzinfo=pytz.timezone('Europe/Warsaw')), needsSubmission=True, group=1, validFileTypes='txt'))
        addlist.append(Assignment(assignmentId=2, name='a', courseId=0, needsSubmission=True))
        addlist.append(Assignment(assignmentId=3, name='b', courseId=0, needsSubmission=False, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=10, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=4, name='c', courseId=1, needsSubmission=False, dueDateTime=datetime.datetime(year=2025, month=6, day=24, hour=8, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=5, name='f', courseId=1, needsSubmission=False, dueDateTime=datetime.datetime(year=2025, month=6, day=23, hour=8, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=6, name='e', courseId=2, needsSubmission=True, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=12, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=7, name='d', courseId=2, needsSubmission=False, dueDateTime=datetime.datetime(year=2025, month=6, day=22, hour=8, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=8, name='g', courseId=3, needsSubmission=True, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=8, tzinfo=pytz.timezone('Europe/Warsaw') )))
        addlist.append(Assignment(assignmentId=9, name='h', courseId=3, needsSubmission=True))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()


        # Assignment Submission
        addlist.append(AssignmentSubmission(assignmentSubmissionId=0, assignmentId=0, studentId=1, submissionDateTime=datetime.datetime(year=2025, month=6, day=25, hour=8, tzinfo=pytz.timezone('Europe/Warsaw')), submission='Hello World'))
        addlist.append(AssignmentSubmission(assignmentSubmissionId=1, assignmentId=2, studentId=1, submissionDateTime=datetime.datetime(year=2025, month=6, day=26, hour=9, tzinfo=pytz.timezone('Europe/Warsaw')), submission='Goodbye World'))
        addlist.append(AssignmentSubmission(assignmentSubmissionId=2, assignmentId=4, studentId=1, submissionDateTime=datetime.datetime(year=2025, month=6, day=27, hour=10, tzinfo=pytz.timezone('Europe/Warsaw')), submission=None))
        addlist.append(AssignmentSubmission(assignmentSubmissionId=3, assignmentId=6, studentId=1, submissionDateTime=datetime.datetime(year=2025, month=6, day=28, hour=11, tzinfo=pytz.timezone('Europe/Warsaw')), submission='Im Still Here World'))
        addlist.append(AssignmentSubmission(assignmentSubmissionId=4, assignmentId=8, studentId=1, submissionDateTime=datetime.datetime(year=2025, month=6, day=28, hour=11, tzinfo=pytz.timezone('Europe/Warsaw')), submission=None))
        

        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # Grade
        addlist.append(Grade(gradeId=0, studentId=0, assignmentId=0))
        addlist.append(Grade(gradeId=1, studentId=1, grade=87.5, assignmentId=1))
        addlist.append(Grade(gradeId=2, studentId=1, grade=65, assignmentId=2))
        addlist.append(Grade(gradeId=3, studentId=1, grade=73.2, assignmentId=3))
        addlist.append(Grade(gradeId=4, studentId=1, grade=99.9, assignmentId=4))
        addlist.append(Grade(gradeId=5, studentId=1, grade=100, assignmentId=5))
        addlist.append(Grade(gradeId=6, studentId=1, assignmentId=6))
        addlist.append(Grade(gradeId=7, studentId=1, grade=0, assignmentId=7))
        addlist.append(Grade(gradeId=8, studentId=1, grade=97, assignmentId=8))
        addlist.append(Grade(gradeId=9, studentId=1, grade=105, assignmentId=9))
        addlist.append(Grade(gradeId=10, studentId=1, grade=-10, assignmentId=0))
        addlist.append(Grade(gradeId=11, studentId=0, grade=66.7, assignmentId=1))
        
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
        
        # Staff
        addlist.append(Staff(staffId=0, name='ben'))
        addlist.append(Staff(staffId=1, name='larry', email='creative@email.com', administrator=True))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # University Events
        addlist.append(UniversityEvents(eventId=0, eventName='Dog Day', dateStartTime= datetime.datetime(year=2025, month=6, day=10), dateEndTime=datetime.datetime(year=2025, month=6, day=11)))
        addlist.append(UniversityEvents(eventId=1, eventName='Cat Day', dateStartTime= datetime.datetime(year=2025, month=5, day=11, hour=8), dateEndTime=datetime.datetime(year=2025, month=5, day=11, hour=23, minute=59), isHoliday=True))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        # FAQ
        addlist.append(FAQ(question="What did the tomato say to the other tomato during a race?", answer="Ketchup."))
        addlist.append(FAQ(question="What do you call a priest that becomes a lawyer?", answer="A father-in-law."))
        addlist.append(FAQ(question="What runs but never goes anywhere?", answer="A fridge."))
        addlist.append(FAQ(question="Why do seagulls fly over the sea?", answer="If they flew over the bay, they would be bagels."))
        addlist.append(FAQ(question="Why are snails slow?", answer="Because they're carrying a house on their back."))
        addlist.append(FAQ(question="How does the ocean say hi?", answer="It waves!"))
        
        session = Session()
        
        for i in addlist:
            session.add(i)
        
        session.commit()
        session.close()
        addlist.clear()
        
        
except sqlalchemy.exc.OperationalError:
    print("Login failed. Invalid username or password.")
    print()