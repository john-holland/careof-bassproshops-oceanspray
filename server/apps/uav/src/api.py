from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from .models import UAVDeployment as UAVDeploymentModel, UAVStatus as UAVStatusModel, Base
from .schemas import UAVDeployment, UAVDeploymentCreate, UAVStatus, UAVStatusCreate
from .database import get_db, engine
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from .auth import (
    get_current_active_user, check_admin_permission,
    require_role, User
)
from .schemas import (
    FlightPlan, FlightPlanCreate,
    EnvironmentalTest, EnvironmentalTestCreate,
    Fishery, FisheryCreate,
    FishTracking, FishTrackingCreate,
    Achievement, AchievementCreate,
    Stall, StallCreate,
    MovementGPSLog, MovementGPSLogCreate,
    MaintenanceSchedule, MaintenanceScheduleCreate,
    Destination, DestinationCreate,
    UnstuckInteraction, UnstuckInteractionCreate,
    PowerReading, PowerReadingCreate
)

# Database setup
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost/uav"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class FlightPlan(Base):
    __tablename__ = "flight_plans"
    id = Column(Integer, primary_key=True, index=True)
    plan_name = Column(String(255), nullable=False)
    source = Column(String(50), nullable=False)
    plan_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class EnvironmentalTest(Base):
    __tablename__ = "environmental_tests"
    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String(255), nullable=False)
    quality_score = Column(Float, nullable=False)
    test_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

class Fishery(Base):
    __tablename__ = "fisheries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    contact_info = Column(JSON)
    operating_hours = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FishTracking(Base):
    __tablename__ = "fish_tracking"
    id = Column(Integer, primary_key=True, index=True)
    fish_type = Column(String(100), nullable=False)
    tracking_data = Column(JSON, nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tracking_metadata = Column(JSON)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    criteria = Column(JSON, nullable=False)
    points = Column(Integer, default=0)
    achieved_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer)

class Stall(Base):
    __tablename__ = "stalls"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), nullable=False)
    stall_type = Column(String(100), nullable=False)
    status = Column(String(50), default='active')
    capacity = Column(Integer)
    current_occupancy = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MovementGPSLog(Base):
    __tablename__ = "movement_gps_logs"
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"
    id = Column(Integer, primary_key=True, index=True)
    schedule_name = Column(String(255), nullable=False)
    maintenance_date = Column(DateTime, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Destination(Base):
    __tablename__ = "destinations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    coordinates = Column(JSON, nullable=False)
    type = Column(String(100))
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UnstuckInteraction(Base):
    __tablename__ = "unstuck_interactions"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), nullable=False)
    interaction_type = Column(String(100), nullable=False)
    status = Column(String(50), default='pending')
    resolution_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

class PowerReading(Base):
    __tablename__ = "power_readings"
    id = Column(Integer, primary_key=True, index=True)
    power_type = Column(String(100), nullable=False)
    reading_value = Column(Float, nullable=False)
    sensor_type = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models for request/response
class FlightPlanBase(BaseModel):
    plan_name: str
    source: str
    plan_data: dict

class FlightPlanCreate(FlightPlanBase):
    pass

class FlightPlan(FlightPlanBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UAV API",
    description="API for managing UAV operations and related data",
    version="1.0.0"
)

# Error handling
class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

@app.exception_handler(APIError)
async def api_error_handler(request, exc: APIError):
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.message
    )

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/uav/fish-data")
async def get_fish_data():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "fish_data": {
            "species": "tuna",
            "count": 150,
            "location": {
                "latitude": 35.0,
                "longitude": -120.0
            },
            "depth": 50.0,
            "temperature": 18.5
        }
    }

@app.post("/api/uav/deploy")
async def deploy_uav(deployment: UAVDeploymentCreate, db: Session = Depends(get_db)):
    db_deployment = UAVDeploymentModel(**deployment.dict())
    db.add(db_deployment)
    db.commit()
    db.refresh(db_deployment)
    
    return {
        "deployment_id": f"uav-{db_deployment.id}",
        "status": "deployed",
        "estimated_completion": (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"
    }

@app.get("/api/uav/status", response_model=List[UAVStatus])
def get_uav_status(db: Session = Depends(get_db)):
    return db.query(UAVStatusModel).all()

# Flight Plans endpoints
@app.post("/flight-plans/", response_model=FlightPlan)
async def create_flight_plan(
    flight_plan: FlightPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pilot"))
):
    try:
        db_flight_plan = FlightPlan(**flight_plan.dict())
        db.add(db_flight_plan)
        db.commit()
        db.refresh(db_flight_plan)
        return db_flight_plan
    except Exception as e:
        raise APIError(f"Failed to create flight plan: {str(e)}")

@app.get("/flight-plans/", response_model=List[FlightPlan])
async def read_flight_plans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        flight_plans = db.query(FlightPlan).offset(skip).limit(limit).all()
        return flight_plans
    except Exception as e:
        raise APIError(f"Failed to fetch flight plans: {str(e)}")

# Environmental Tests endpoints
@app.post("/environmental-tests/", response_model=EnvironmentalTest)
async def create_environmental_test(
    test: EnvironmentalTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("scientist"))
):
    try:
        db_test = EnvironmentalTest(**test.dict())
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        return db_test
    except Exception as e:
        raise APIError(f"Failed to create environmental test: {str(e)}")

@app.get("/environmental-tests/", response_model=List[EnvironmentalTest])
async def read_environmental_tests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        tests = db.query(EnvironmentalTest).offset(skip).limit(limit).all()
        return tests
    except Exception as e:
        raise APIError(f"Failed to fetch environmental tests: {str(e)}")

# Fishery endpoints
@app.post("/fisheries/", response_model=Fishery)
async def create_fishery(
    fishery: FisheryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager"))
):
    try:
        db_fishery = Fishery(**fishery.dict())
        db.add(db_fishery)
        db.commit()
        db.refresh(db_fishery)
        return db_fishery
    except Exception as e:
        raise APIError(f"Failed to create fishery: {str(e)}")

@app.get("/fisheries/", response_model=List[Fishery])
async def read_fisheries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        fisheries = db.query(Fishery).offset(skip).limit(limit).all()
        return fisheries
    except Exception as e:
        raise APIError(f"Failed to fetch fisheries: {str(e)}")

# Fish Tracking endpoints
@app.post("/fish-tracking/", response_model=FishTracking)
async def create_fish_tracking(
    tracking: FishTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("scientist"))
):
    try:
        db_tracking = FishTracking(**tracking.dict())
        db.add(db_tracking)
        db.commit()
        db.refresh(db_tracking)
        return db_tracking
    except Exception as e:
        raise APIError(f"Failed to create fish tracking: {str(e)}")

@app.get("/fish-tracking/", response_model=List[FishTracking])
async def read_fish_tracking(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        tracking_data = db.query(FishTracking).offset(skip).limit(limit).all()
        return tracking_data
    except Exception as e:
        raise APIError(f"Failed to fetch fish tracking data: {str(e)}")

# Achievement endpoints
@app.post("/achievements/", response_model=Achievement)
async def create_achievement(
    achievement: AchievementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    try:
        db_achievement = Achievement(**achievement.dict())
        db.add(db_achievement)
        db.commit()
        db.refresh(db_achievement)
        return db_achievement
    except Exception as e:
        raise APIError(f"Failed to create achievement: {str(e)}")

@app.get("/achievements/", response_model=List[Achievement])
async def read_achievements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        achievements = db.query(Achievement).offset(skip).limit(limit).all()
        return achievements
    except Exception as e:
        raise APIError(f"Failed to fetch achievements: {str(e)}")

# Stall endpoints
@app.post("/stalls/", response_model=Stall)
async def create_stall(
    stall: StallCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager"))
):
    try:
        db_stall = Stall(**stall.dict())
        db.add(db_stall)
        db.commit()
        db.refresh(db_stall)
        return db_stall
    except Exception as e:
        raise APIError(f"Failed to create stall: {str(e)}")

@app.get("/stalls/", response_model=List[Stall])
async def read_stalls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        stalls = db.query(Stall).offset(skip).limit(limit).all()
        return stalls
    except Exception as e:
        raise APIError(f"Failed to fetch stalls: {str(e)}")

# Movement GPS Log endpoints
@app.post("/gps-logs/", response_model=MovementGPSLog)
async def create_gps_log(
    log: MovementGPSLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pilot"))
):
    try:
        db_log = MovementGPSLog(**log.dict())
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as e:
        raise APIError(f"Failed to create GPS log: {str(e)}")

@app.get("/gps-logs/", response_model=List[MovementGPSLog])
async def read_gps_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        logs = db.query(MovementGPSLog).offset(skip).limit(limit).all()
        return logs
    except Exception as e:
        raise APIError(f"Failed to fetch GPS logs: {str(e)}")

# Maintenance Schedule endpoints
@app.post("/maintenance/", response_model=MaintenanceSchedule)
async def create_maintenance_schedule(
    schedule: MaintenanceScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("maintenance"))
):
    try:
        db_schedule = MaintenanceSchedule(**schedule.dict())
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except Exception as e:
        raise APIError(f"Failed to create maintenance schedule: {str(e)}")

@app.get("/maintenance/", response_model=List[MaintenanceSchedule])
async def read_maintenance_schedules(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        schedules = db.query(MaintenanceSchedule).offset(skip).limit(limit).all()
        return schedules
    except Exception as e:
        raise APIError(f"Failed to fetch maintenance schedules: {str(e)}")

# Destination endpoints
@app.post("/destinations/", response_model=Destination)
async def create_destination(
    destination: DestinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager"))
):
    try:
        db_destination = Destination(**destination.dict())
        db.add(db_destination)
        db.commit()
        db.refresh(db_destination)
        return db_destination
    except Exception as e:
        raise APIError(f"Failed to create destination: {str(e)}")

@app.get("/destinations/", response_model=List[Destination])
async def read_destinations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        destinations = db.query(Destination).offset(skip).limit(limit).all()
        return destinations
    except Exception as e:
        raise APIError(f"Failed to fetch destinations: {str(e)}")

# Unstuck Interaction endpoints
@app.post("/unstuck/", response_model=UnstuckInteraction)
async def create_unstuck_interaction(
    interaction: UnstuckInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("maintenance"))
):
    try:
        db_interaction = UnstuckInteraction(**interaction.dict())
        db.add(db_interaction)
        db.commit()
        db.refresh(db_interaction)
        return db_interaction
    except Exception as e:
        raise APIError(f"Failed to create unstuck interaction: {str(e)}")

@app.get("/unstuck/", response_model=List[UnstuckInteraction])
async def read_unstuck_interactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        interactions = db.query(UnstuckInteraction).offset(skip).limit(limit).all()
        return interactions
    except Exception as e:
        raise APIError(f"Failed to fetch unstuck interactions: {str(e)}")

# Power Reading endpoints
@app.post("/power-readings/", response_model=PowerReading)
async def create_power_reading(
    reading: PowerReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("technician"))
):
    try:
        db_reading = PowerReading(**reading.dict())
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        return db_reading
    except Exception as e:
        raise APIError(f"Failed to create power reading: {str(e)}")

@app.get("/power-readings/", response_model=List[PowerReading])
async def read_power_readings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        readings = db.query(PowerReading).offset(skip).limit(limit).all()
        return readings
    except Exception as e:
        raise APIError(f"Failed to fetch power readings: {str(e)}") 