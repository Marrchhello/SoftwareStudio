# Change log V1 -> V2: add imports for engine, bcrypt. Change import from models to database_I

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, update, delete, engine
from sqlalchemy.orm import sessionmaker
from database import *
import bcrypt


# Check if student/teacher/staff account can be created.
# Change log V1: created function to test combinations of uuid, roleId, and role for validity.
def can_create_user(engine: Engine, uuid: int, roleId: int, role: Roles) -> (bool, str):
    """Checks if student/teacher/staff account can be created.
    
    Params:
    engine: db engine
    uuid: id to check if in db
    role: role of id
    
    Returns:
    (bool, str): (can be created, error message)
    """
    
    with Session(engine) as session:
        
        # Check if user id exists in User table
        check_users = select(User).where(User.userId == uuid)
        
        if session.execute(check_users).first() is not None: 
            return (False, "User Id exists in User table.") 
        
        
        # Check that an account for role id and role does not already exist.
        check_role_acc = select(User).where(User.roleId == roleId).where(User.role == role)
        
        if session.execute(check_role_acc).first() is not None:
            return (False, "Account for Role and Role ID exists.")
           
            
        # Check if role id exists in role table.
        check_role_id = None
        
        if role == Roles.STUDENT:
            check_role_id = select(Student).where(Student.studentId == roleId)
        elif role == Roles.TEACHER:
            check_role_id = select(Teacher).where(Teacher.teacherId == roleId)
        elif role == Roles.STAFF:
            check_role_id = select(Staff).where(Staff.staffId == roleId)
        else:
            return (False, "Invalid role.")
        
        if session.execute(check_role_id).first() is None:
            return (False, "ID does not exist in corresponding Role table.")
        
        
    # If this statement is reached, the account can be created.
    return (True, "None")
        

# Create User
# Change log V1: create function for creating a user, while auto encrypting the password.
# Change log V1 -> V2: update to check if params are adequate, and add roleId param.
def create_user(engine, uuid: int, roleId: int, username: str, password: str, role: Roles) -> bool:
    """Create a new user. Automatically encrypts password.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    uuid: id number for user table
    roleId: id number for student/teacher/staff member.
    username: string
    password: string
    role: STUDENT/TEACHER/STAFF
    
    Returns:
    True if the user was created sucessfully. False otherwise.
    """
    
    # Test if passed params can create a user.
    test_params = can_create_user(engine, uuid, roleId, role)
    if not test_params[0]:
        print(f"Error: {test_params[1]}")
        return False
    
    # Encrypt password
    hashed = password.encode()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(hashed, salt)
    
    # Create User
    with Session(engine) as session:

        user = User(userId=uuid, roleId=roleId, username=username, password=hashed, role=role)

        # If creating user causes an error, return false
        try:
            session.add(user)
            session.commit()
        except Exception as e:
            return False

    # If statement is reached, user was created.
    return True


# # Insert data
# async def insert_data(session: AsyncSession, table, data: dict):
#     stmt = insert(table).values(**data)
#     await session.execute(stmt)
#     await session.commit()


# # Select/read data
# async def select_data(session: AsyncSession, table, filters=None):
#     stmt = select(table)
#     if filters:
#         stmt = stmt.filter_by(**filters)
#     result = await session.execute(stmt)
#     return result.scalars().all()

