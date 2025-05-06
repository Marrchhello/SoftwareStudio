from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, update, delete, engine
from sqlalchemy.orm import sessionmaker
from database_I import *
import bcrypt

# Create User
# Change log: create function for creating a user, while auto encrypting the password.
def create_user(engine, uuid: int, username: str, password: str, role: Roles) -> bool:
    """Create a new user. Automatically encrypts password.
    
    Params:
    engine: sqlalchemy engine to connect to db.
    uuid: id number for student/teacher/staff member.
    username: string
    password: string
    role: STUDENT/TEACHER/STAFF
    
    Returns:
    True if the user was created sucessfully. False otherwise.
    """
    
    hashed = password.encode()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(hashed, salt)

    output = True

    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(id=uuid, username=username, password=hashed, role=role)

    try:
        session.add(user)
        session.commit()
    except Exception as e:
        output = False

    session.close()
    return output


# Insert data
async def insert_data(session: AsyncSession, table, data: dict):
    stmt = insert(table).values(**data)
    await session.execute(stmt)
    await session.commit()


# Select/read data
async def select_data(session: AsyncSession, table, filters=None):
    stmt = select(table)
    if filters:
        stmt = stmt.filter_by(**filters)
    result = await session.execute(stmt)
    return result.scalars().all()

