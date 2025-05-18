from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from database import Base

# Replace with your actual database URL
DATABASE_URL = "postgresql+psycopg://postgres:password@localhost/postgres"  

# Create the database engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a session factory
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Function to initialize the database schema
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)