from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, update, delete
from backend.database.database_I import  Degree, Student  # Add Degree to the import

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

