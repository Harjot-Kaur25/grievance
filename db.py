from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DB_URL, DATA_DIR

DATA_DIR.mkdir(exist_ok=True)
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True)
    complaint_id = Column(Integer, nullable=True)       # id from the dataset (null for API-created)
    source = Column(String, default="api")             # 'dataset' or 'api'
    category = Column(String, nullable=True)
    sub_category = Column(String)
    ward = Column(String)
    status = Column(String)
    staff_remarks = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    age_hours = Column(Float, nullable=True)
    priority = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
