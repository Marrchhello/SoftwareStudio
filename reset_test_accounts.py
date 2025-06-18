import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).parent / "backend")
sys.path.append(backend_dir)

from sqlalchemy import create_engine
from Database import Base, User, Student, Teacher
from sqlalchemy.orm import Session

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:4243/postgres")

def reset_test_accounts():
    print("\n🔄 Resetting test accounts...")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL, echo=True)
        
        # Test connection
        print("\n🔍 Testing database connection...")
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ Database connection successful!")
        
        # Delete test accounts
        with Session(engine) as session:
            print("\n🗑️ Removing existing test accounts...")
            
            # Delete student (ID: 999)
            student = session.query(Student).filter(Student.studentId == 999).first()
            if student:
                session.delete(student)
                print("✅ Deleted test student record")
            
            # Delete teacher (ID: 888)
            teacher = session.query(Teacher).filter(Teacher.teacherId == 888).first()
            if teacher:
                session.delete(teacher)
                print("✅ Deleted test teacher record")
            
            # Delete user accounts
            user_999 = session.query(User).filter(User.userId == 999).first()
            if user_999:
                session.delete(user_999)
                print("✅ Deleted test student user account")
                
            user_888 = session.query(User).filter(User.userId == 888).first()
            if user_888:
                session.delete(user_888)
                print("✅ Deleted test teacher user account")
            
            session.commit()
            print("\n✅ Test accounts reset successful!")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nMake sure:")
        print("1. PostgreSQL is running on localhost:5432")
        print("2. Database 'postgres' exists")
        print("3. User 'postgres' with password 'password' has access")

if __name__ == "__main__":
    reset_test_accounts() 