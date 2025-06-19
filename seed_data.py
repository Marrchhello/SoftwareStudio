import datetime
import pytz
from sqlalchemy.orm import Session
from Database import *
from user_managment import create_user
from sqlalchemy import create_engine
import os

def seed_demo_data(engine):
    """Seed demo data into the database if it doesn't exist"""
    print("Checking if demo data needs to be seeded...")
    
    with Session(engine) as session:
        # Check if users already exist
        existing_user = session.query(User).filter_by(username='rick').first()
        if existing_user:
            print("Demo data already exists, skipping seeding...")
            return
        
        print("Seeding demo data...")
        
        # Create demo users
        try:
            # Create Rick (teacher)
            create_user(engine, roleId=1, username='rick', password='roll', role=Roles.TEACHER)
            print("Created user: rick (teacher)")
            
            # Create Ben (student)
            create_user(engine, roleId=1, username='ben', password='banana', role=Roles.STUDENT)
            print("Created user: ben (student)")
            
        except Exception as e:
            print(f"Error creating users: {e}")
            return
        
        # Create demo data for courses, teachers, students, etc.
        try:
            # Course Catalog
            courses = [
                CourseCatalog(courseId=0, courseName='Prog', isBiWeekly=True),
                CourseCatalog(courseId=1, courseName='Optimization', semester=4, ects=5, isBiWeekly=False),
                CourseCatalog(courseId=2, courseName='Engrish', semester=3, ects=3, isBiWeekly=True),
                CourseCatalog(courseId=3, courseName='Javanese', semester=2, ects=4, isBiWeekly=False)
            ]
            session.add_all(courses)
            session.commit()
            print("Created course catalog entries")
            
            # Degree
            degrees = [
                Degree(degreeId=0),
                Degree(degreeId=1, name='Computer Science', numSemesters=7)
            ]
            session.add_all(degrees)
            session.commit()
            print("Created degree entries")
            
            # Teacher
            teachers = [
                Teacher(teacherId=0),
                Teacher(teacherId=1, name='Rick Astley', title='Mr Dr Prof', email='rick@roll.lol')
            ]
            session.add_all(teachers)
            session.commit()
            print("Created teacher entries")
            
            # Student
            students = [
                Student(studentId=0),
                Student(studentId=1, semester=4, degreeId=1, name='ben', age=22, email='roll@rick.lel')
            ]
            session.add_all(students)
            session.commit()
            print("Created student entries")
            
            # Class Date Time
            class_times = [
                ClassDateTime(classDateTimeId=0, courseId=0, dateStartTime=datetime.datetime(year=2025, month=12, day=20, hour=10, minute=0), endTime=datetime.time(hour=11, minute=30)),
                ClassDateTime(classDateTimeId=1, courseId=0, dateStartTime=datetime.datetime(year=2025, month=12, day=25, hour=11, minute=0, tzinfo=pytz.timezone('Europe/Warsaw')), endTime=datetime.time(11, 30)),
                ClassDateTime(classDateTimeId=2, courseId=1, dateStartTime=datetime.datetime(year=2025, month=5, day=9, hour=9, minute=51), endTime=datetime.time(hour=14, minute=45))
            ]
            session.add_all(class_times)
            session.commit()
            print("Created class date time entries")
            
            # Room
            rooms = [
                Room(roomId=0, courseId=0),
                Room(roomId=1, courseId=1, building='B5', roomNumber=405)
            ]
            session.add_all(rooms)
            session.commit()
            print("Created room entries")
            
            # Course Teacher
            course_teachers = [
                CourseTeacher(courseTeacherId=0, courseId=0),
                CourseTeacher(courseTeacherId=1, courseId=1, teacherId=1),
                CourseTeacher(courseTeacherId=2, courseId=2, teacherId=1)
            ]
            session.add_all(course_teachers)
            session.commit()
            print("Created course teacher entries")
            
            # Assignment
            assignments = [
                Assignment(assignmentId=0, name='Hello World', courseId=0, needsSubmission=True),
                Assignment(assignmentId=1, name='Goodbye World', desc='Make Hello World in Assembly', courseId=1, dueDateTime=datetime.datetime(year=2025, month=6, day=25, hour=8, tzinfo=pytz.timezone('Europe/Warsaw')), needsSubmission=True, group=1, validFileTypes='txt'),
                Assignment(assignmentId=2, name='a', courseId=0, needsSubmission=True)
            ]
            session.add_all(assignments)
            session.commit()
            print("Created assignment entries")
            
            # Course Student
            course_students = [
                CourseStudent(courseStudentId=0, courseId=0, studentId=0),
                CourseStudent(courseStudentId=1, courseId=1, studentId=1, group=1)
            ]
            session.add_all(course_students)
            session.commit()
            print("Created course student entries")
            
            # Staff
            staff = [
                Staff(staffId=0, name='ben'),
                Staff(staffId=1, name='larry', email='creative@email.com', administrator=True)
            ]
            session.add_all(staff)
            session.commit()
            print("Created staff entries")
            
            # University Events
            events = [
                UniversityEvents(eventId=0, eventName='Dog Day', dateStartTime=datetime.datetime(year=2025, month=6, day=10), dateEndTime=datetime.datetime(year=2025, month=6, day=11)),
                UniversityEvents(eventId=1, eventName='Cat Day', dateStartTime=datetime.datetime(year=2025, month=5, day=11, hour=8), dateEndTime=datetime.datetime(year=2025, month=5, day=11, hour=23, minute=59), isHoliday=True)
            ]
            session.add_all(events)
            session.commit()
            print("Created university events entries")
            
            # FAQ
            faqs = [
                FAQ(question="What did the tomato say to the other tomato during a race?", answer="Ketchup."),
                FAQ(question="What do you call a priest that becomes a lawyer?", answer="A father-in-law."),
                FAQ(question="What runs but never goes anywhere?", answer="A fridge."),
                FAQ(question="Why do seagulls fly over the sea?", answer="If they flew over the bay, they would be bagels."),
                FAQ(question="Why are snails slow?", answer="Because they're carrying a house on their back."),
                FAQ(question="How does the ocean say hi?", answer="It waves!")
            ]
            session.add_all(faqs)
            session.commit()
            print("Created FAQ entries")
            
            print("Demo data seeding completed successfully!")
            
        except Exception as e:
            print(f"Error seeding demo data: {e}")
            session.rollback()
            raise 