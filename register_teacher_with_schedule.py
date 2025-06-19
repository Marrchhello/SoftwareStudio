import os
import sys
import datetime
from sqlalchemy import create_engine
from backend.InsertDeleteManager import DatabaseManager
# Get DB URL (same as backend/app.py)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost/postgres")
engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)
db = DatabaseManager(engine)

def prompt_teacher_info():
    print("--- Register Teacher ---")
    teacher_id = int(input("Teacher ID: "))
    name = input("Name: ")
    title = input("Title: ")
    email = input("Email: ")
    return teacher_id, name, title, email

def prompt_course_info():
    print("--- Add Course ---")
    course_id = int(input("Course ID: "))
    course_name = input("Course Name: ")
    semester = int(input("Semester (int): "))
    ects = int(input("ECTS (int): "))
    return course_id, course_name, semester, ects

def prompt_room_info():
    print("--- Add Room ---")
    room_id = int(input("Room ID: "))
    building = input("Building: ")
    room_number = int(input("Room Number: "))
    return room_id, building, room_number

def prompt_schedule_info():
    print("--- Add Class Time ---")
    cdt_id = int(input("ClassDateTime ID: "))
    date_str = input("Date and Start Time (YYYY-MM-DD HH:MM): ")
    end_time_str = input("End Time (HH:MM): ")
    date_and_start_time = datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M")
    end_time = datetime.datetime.strptime(end_time_str, "%H:%M").time()
    return cdt_id, date_and_start_time, end_time

def main():
    teacher_id, name, title, email = prompt_teacher_info()
    try:
        db.add_teacher(teacher_id, name, title, email)
        print(f"Teacher {name} registered.")
    except Exception as e:
        print(f"Warning: {e}")

    while True:
        course_id, course_name, semester, ects = prompt_course_info()
        try:
            db.add_course(course_id, course_name, semester, ects)
            print(f"Course {course_name} added.")
        except Exception as e:
            print(f"Warning: {e}")
        room_id, building, room_number = prompt_room_info()
        try:
            db.add_room(room_id, course_id, building, room_number)
            print(f"Room {building} {room_number} added.")
        except Exception as e:
            print(f"Warning: {e}")
        ct_id = int(input("CourseTeacher ID: "))
        try:
            db.add_course_teacher(ct_id, course_id, teacher_id)
            print(f"Teacher assigned to course.")
        except Exception as e:
            print(f"Warning: {e}")
        while True:
            cdt_id, date_and_start_time, end_time = prompt_schedule_info()
            try:
                db.add_class_time(cdt_id, course_id, date_and_start_time, end_time)
                print(f"Class time added.")
            except Exception as e:
                print(f"Warning: {e}")
            more_times = input("Add another class time for this course? (y/n): ").lower()
            if more_times != 'y':
                break
        more_courses = input("Add another course for this teacher? (y/n): ").lower()
        if more_courses != 'y':
            break
    print("Registration complete.")

if __name__ == "__main__":
    main() 