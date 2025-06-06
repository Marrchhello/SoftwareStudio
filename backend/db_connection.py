from Database import Base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@db:5432/postgres")

# Create the database engine
engine = create_async_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

# Create a session factory
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Function to initialize the database schema
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)