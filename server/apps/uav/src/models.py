from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class UAVDeployment(Base):
    __tablename__ = "uav_deployment"
    id = Column(Integer, primary_key=True)
    location = Column(String, nullable=False)
    deployed_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Deployed")

class UAVStatus(Base):
    __tablename__ = "uav_status"
    id = Column(Integer, primary_key=True)
    status = Column(String, nullable=False)
    battery_level = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow) 