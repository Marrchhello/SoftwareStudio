# File to showcase how to create a user, and how the can_create_user function works.
# can_create_user is used in create_user, so you can just pass in the args directly
# instead of calling can_create_user. 

from backend.Database import *
from backend.user_managment import create_user, can_create_user
import sqlalchemy
from sqlalchemy import *
from sqlalchemy.orm import *
from backend.Database import Base
from backend.db_connection import engine  # lub jak masz nazwany engine
from backend.Database import User
from sqlalchemy.orm import Session

engine = create_engine('postgresql+psycopg://postgres:password@localhost:4243/postgres')
Base.metadata.create_all(engine)

# Create user
# Parameters: engine, roleId, username, password, role, [uuid]
print(create_user(engine, roleId=1, username='ben', password='banana', role=Roles.STUDENT))
print(create_user(engine, roleId=1, username='rick', password='roll', role=Roles.TEACHER))

with Session(engine) as session:
# Query User
    u1 = session.query(User).filter_by(username='ben').first()

# Test password
print('Incorrect password: ',u1.verify_password(pass_bytes='Banana'.encode()))
print('Correct password: ', u1.verify_password(pass_bytes='banana'.encode()))

# test can create user:

# Error: account for student exists
res = can_create_user(engine, 2, 1, Roles.STUDENT)
print(f"Success?: {res[0]}, Error: {res[1]}")

# error: user id exists
res = can_create_user(engine, 1, 1, Roles.STUDENT)
print(f"Success?: {res[0]}, Error: {res[1]}")

# error, role id does not exists in role table
res = can_create_user(engine, 0, 4, Roles.STUDENT)
print(f"Success?: {res[0]}, Error: {res[1]}")

# no error
res = can_create_user(engine, 2, 0, Roles.STUDENT)
print(f"Success?: {res[0]}, Error: {res[1]}")

def seed_demo_users():
    with Session(engine) as session:
        if not session.query(User).filter_by(username='rick').first():
            create_user(engine, roleId=1, username='rick', password='roll', role='TEACHER')
        if not session.query(User).filter_by(username='ben').first():
            create_user(engine, roleId=1, username='ben', password='banana', role='STUDENT')