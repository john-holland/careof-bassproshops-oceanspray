from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Fish(Base):
    __tablename__ = "fish"
    id = Column(Integer, primary_key=True)
    species = Column(String, nullable=False)
    size = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    caught_at = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=False)
    is_sustainable = Column(Boolean, default=True)

class OceanHealth(Base):
    __tablename__ = "ocean_health"
    id = Column(Integer, primary_key=True)
    temperature = Column(Float, nullable=False)
    salinity = Column(Float, nullable=False)
    ph_level = Column(Float, nullable=False)
    pollution_level = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=False)

class PressureTank(Base):
    __tablename__ = "pressure_tank"
    id = Column(Integer, primary_key=True)
    pressure = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    last_maintenance = Column(DateTime, default=datetime.utcnow)
    is_operational = Column(Boolean, default=True) 