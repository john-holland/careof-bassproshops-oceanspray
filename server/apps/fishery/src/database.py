from sqlalchemy import create_engine, Column, Integer, String, MetaData, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError
import os

# Default to PostgreSQL connection string if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/fishery")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
metadata = MetaData()

# Version tracking table
db_version_table = Table(
    "db_version",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("version", String, nullable=False)
)

# Initial version
def get_current_version(session: Session):
    try:
        result = session.execute(db_version_table.select().order_by(db_version_table.c.id.desc())).first()
        return result[1] if result else None
    except OperationalError:
        return None

def set_version(session: Session, version: str):
    session.execute(db_version_table.insert().values(version=version))
    session.commit()

def run_migrations(session: Session):
    # Example: Add migration steps here
    # For now, just ensure version table exists and set initial version
    metadata.create_all(engine, tables=[db_version_table])
    if not get_current_version(session):
        set_version(session, "1.0.0")
    # Placeholder for future migrations and archive merging
    # e.g., merge_archives(session)

def get_db():
    db = SessionLocal()
    try:
        run_migrations(db)
        yield db
    finally:
        db.close() 