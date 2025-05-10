from database.InsertDeleteMenager import DatabaseManager
from sqlalchemy import create_engine
import os
from passlib.context import CryptContext

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)
db = DatabaseManager(engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Add degrees
db.add_degree(1, "Computer Science")
db.add_degree(2, "Electrical Engineering")

# Add teachers
db.add_teacher(1001, name="Dr. Alice Smith", email="alice@agh.edu.pl", hashed_password=pwd_context.hash("alicepass"), title="PhD")
db.add_teacher(1002, name="Dr. Bob Brown", email="bob@agh.edu.pl", hashed_password=pwd_context.hash("bobpass"), title="PhD")

# Add students
db.add_student(2001, email="student1@agh.edu.pl", hashed_password=pwd_context.hash("studentpass"), semester=2, year=1, degree_id=1, age=20)
db.add_student(2002, email="student2@agh.edu.pl", hashed_password=pwd_context.hash("studentpass"), semester=2, year=1, degree_id=1, age=21)

# Add courses
db.add_course(3001, "Software Studio", teacher_id=1001, semester=2, year=1, ects=6)
db.add_course(3002, "Algorithms", teacher_id=1002, semester=2, year=1, ects=5)

# Enroll students
db.add_course_student(1, 3001, 2001)
db.add_course_student(2, 3002, 2001)
db.add_course_student(3, 3001, 2002)

# Add grades
db.add_grade(1, 1, 4.5)
db.add_grade(2, 2, 5.0)
db.add_grade(3, 3, 3.5)

print("Demo data inserted!")