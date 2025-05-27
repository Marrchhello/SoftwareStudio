import datetime, pytz, sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from database import *

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
        addlist.append(Grade(gradeId=0, studentId=0, assignmentId=0))
        addlist.append(Grade(gradeId=1, studentId=1, grade=87.5, assignmentId=1))
        
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
        addlist.append(UniversityEvents(eventId=0, eventName='Dog Day', dateStartTime= datetime.datetime(year=2025, month=5, day=10), dateEndTime=datetime.datetime(year=2025, month=5, day=11)))
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