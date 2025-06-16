# Change log V1 -> V2: add imports for engine, bcrypt. Change import from models to database_I

import bcrypt
from Database import *
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, update, delete, Engine
from sqlalchemy.orm import sessionmaker
from auth import get_password_hash, verify_password


# Check if student/teacher/staff account can be created.
# Change log V1: created function to test combinations of uuid, roleId, and role for validity.
def can_create_user(engine: Engine, uuid: int, roleId: int, role: Roles) -> tuple[bool, str]:
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
        
        if check_role_id is not None:
            if session.execute(check_role_id).first() is None:
                return (False, "ID does not exist in corresponding Role table.")
        
        
    # If this statement is reached, the account can be created.
    return (True, "None")
        

# Create User
# Change log V1: create function for creating a user, while auto encrypting the password.
# Change log V1 -> V2: update to check if params are adequate, and add roleId param.
def create_user(engine: Engine, roleId: int, username: str, password: str, role: Roles, uuid: int = None) -> tuple[bool, str]:
    """Create a new user. Automatically encrypts password.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    uuid: id number for user table
    roleId: id number for student/teacher/staff member.
    username: string
    password: string
    role: STUDENT/TEACHER/STAFF
    
    Returns:
    tuple with bool whether or not the user was created sucessfully, and a string with the error message if not.
    """

    if uuid is None:
        # Get max value of user_id from table User
        with engine.connect() as conn:
            result = conn.execute(select(func.max(User.userId)))
            max_id = result.scalar()
            uuid = (max_id or 0) + 1
    
    # Test if passed params can create a user.
    test_params = can_create_user(engine, uuid, roleId, role)
    if not test_params[0]:
        return (False, f"Error in can_create_user: {test_params[1]}")
    
    try:
        # Encrypt password using the auth module's function
        hashed_password = get_password_hash(password)
        #print(f"Password hashed successfully")
        
        # Convert hashed password to bytes if it's not already
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        
        # Create User
        with Session(engine) as session:
            try:
                #print(f"Creating user with ID: {uuid}, roleId: {roleId}, role: {role}, username: {username}")
                user = User(userId=uuid, roleId=roleId, username=username, password=hashed_password, role=role)
                session.add(user)
                session.commit()
                #print(f"User created successfully")
                return (True, "User created successfully")
            except Exception as e:
                session.rollback()
                return (False, f"Error in database operation: {str(e)}")
    except Exception as e:
        return (False, f"Error in password hashing or session creation: {str(e)}")


# Verify user credentials
def verify_user_credentials(engine, username: str, password: str) -> tuple[bool, dict]:
    """Verify user credentials.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    username: string
    password: string
    
    Returns:
    (bool, dict): (is_valid, user_data)
    """
    
    with Session(engine) as session:
        # Query the database for the user
        query = select(User).where(User.username == username)
        result = session.execute(query).first()
        
        if not result:
            return (False, None)
        
        user = result[0]
        
        # Verify the password
        stored_password = user.password
        if isinstance(stored_password, bytes):
            stored_password = stored_password.decode('utf-8')
            
        if not verify_password(password, stored_password):
            return (False, None)
        
        # Return user information
        user_data = {
            "user_id": user.userId,
            "role": user.role.value,
            "role_id": user.roleId,
            "username": user.username
        }
        
        return (True, user_data)


# Get user by ID
def get_user_by_id(engine, user_id: int) -> dict:
    """Get user by ID.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    user_id: int
    
    Returns:
    dict: user data or None if not found
    """
    
    with Session(engine) as session:
        # Query the database for the user
        query = select(User).where(User.userId == user_id)
        result = session.execute(query).first()
        
        if not result:
            return None
        
        user = result[0]
        
        # Return user information
        user_data = {
            "user_id": user.userId,
            "role": user.role.value,
            "role_id": user.roleId,
            "username": user.username
        }
        
        return user_data


# Change password
def change_password(engine, user_id: int, old_password: str, new_password: str) -> bool:
    """Change user password.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    user_id: int
    old_password: string
    new_password: string
    
    Returns:
    bool: True if password was changed successfully, False otherwise
    """
    
    with Session(engine) as session:
        # Query the database for the user
        query = select(User).where(User.userId == user_id)
        result = session.execute(query).first()
        
        if not result:
            return False
        
        user = result[0]
        
        # Verify the old password
        stored_password = user.password
        if isinstance(stored_password, bytes):
            stored_password = stored_password.decode('utf-8')
            
        if not verify_password(old_password, stored_password):
            return False
        
        # Hash the new password
        hashed_password = get_password_hash(new_password)
        
        # Update the password
        update_stmt = update(User).where(User.userId == user_id).values(password=hashed_password)
        
        try:
            session.execute(update_stmt)
            session.commit()
            return True
        except Exception as e:
            print(f"Error changing password: {e}")
            session.rollback()
            return False

