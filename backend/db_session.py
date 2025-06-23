from sqlalchemy.orm import sessionmaker
from InsertDeleteManager import DatabaseManager
import os
from sqlalchemy import create_engine
from Database import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost:4243/postgres")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
Base.metadata.create_all(bind=engine)
db = DatabaseManager(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close() 

 
def getEngine():
    return engine