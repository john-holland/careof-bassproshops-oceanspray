from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

# Base models
class FlightPlanBase(BaseModel):
    plan_name: str = Field(..., min_length=1, max_length=255)
    source: str = Field(..., pattern='^(DJI|SwellPro|HolyStone|PowerVision)$')
    plan_data: Dict[str, Any]

class EnvironmentalTestBase(BaseModel):
    test_name: str = Field(..., min_length=1, max_length=255)
    quality_score: float = Field(..., ge=0.0, le=100.0)
    notes: Optional[str] = None

class FisheryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    contact_info: Optional[Dict[str, Any]] = None
    operating_hours: Optional[Dict[str, Any]] = None

class FishTrackingBase(BaseModel):
    fish_type: str = Field(..., min_length=1, max_length=100)
    tracking_data: Dict[str, Any]
    location_lat: float = Field(..., ge=-90.0, le=90.0)
    location_lng: float = Field(..., ge=-180.0, le=180.0)
    metadata: Optional[Dict[str, Any]] = None

class AchievementBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    criteria: Dict[str, Any]
    points: int = Field(default=0, ge=0)
    user_id: Optional[int] = None

class StallBase(BaseModel):
    location: str = Field(..., min_length=1, max_length=255)
    stall_type: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default='active', pattern='^(active|inactive|maintenance)$')
    capacity: Optional[int] = Field(None, gt=0)
    current_occupancy: int = Field(default=0, ge=0)

class MovementGPSLogBase(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    notes: Optional[str] = None

class MaintenanceScheduleBase(BaseModel):
    schedule_name: str = Field(..., min_length=1, max_length=255)
    maintenance_date: datetime
    description: Optional[str] = None

class DestinationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    coordinates: Dict[str, Any]
    type: Optional[str] = Field(None, max_length=100)
    status: str = Field(default='active', pattern='^(active|inactive|maintenance)$')

class UnstuckInteractionBase(BaseModel):
    location: str = Field(..., min_length=1, max_length=255)
    interaction_type: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default='pending', pattern='^(pending|in_progress|resolved|failed)$')
    resolution_notes: Optional[str] = None

class PowerReadingBase(BaseModel):
    power_type: str = Field(..., min_length=1, max_length=100)
    reading_value: float
    sensor_type: str = Field(..., min_length=1, max_length=100)

# Create models
class FlightPlanCreate(FlightPlanBase):
    pass

class EnvironmentalTestCreate(EnvironmentalTestBase):
    pass

class FisheryCreate(FisheryBase):
    pass

class FishTrackingCreate(FishTrackingBase):
    pass

class AchievementCreate(AchievementBase):
    pass

class StallCreate(StallBase):
    pass

class MovementGPSLogCreate(MovementGPSLogBase):
    pass

class MaintenanceScheduleCreate(MaintenanceScheduleBase):
    pass

class DestinationCreate(DestinationBase):
    pass

class UnstuckInteractionCreate(UnstuckInteractionBase):
    pass

class PowerReadingCreate(PowerReadingBase):
    pass

# Response models
class FlightPlan(FlightPlanBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class EnvironmentalTest(EnvironmentalTestBase):
    id: int
    test_date: datetime

    class Config:
        orm_mode = True

class Fishery(FisheryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class FishTracking(FishTrackingBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class Achievement(AchievementBase):
    id: int
    achieved_at: datetime

    class Config:
        orm_mode = True

class Stall(StallBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MovementGPSLog(MovementGPSLogBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class MaintenanceSchedule(MaintenanceScheduleBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Destination(DestinationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UnstuckInteraction(UnstuckInteractionBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        orm_mode = True

class PowerReading(PowerReadingBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Add UAVDeployment and UAVStatus models
class UAVDeploymentBase(BaseModel):
    location: str = Field(..., min_length=1, max_length=255)
    status: str = Field(default="Deployed", pattern='^(Deployed|Returned|Failed)$')

class UAVDeploymentCreate(UAVDeploymentBase):
    pass

class UAVDeployment(UAVDeploymentBase):
    id: int
    deployed_at: datetime

    class Config:
        orm_mode = True

class UAVStatusBase(BaseModel):
    status: str = Field(..., min_length=1, max_length=255)
    battery_level: float = Field(..., ge=0.0, le=100.0)
    location: str = Field(..., min_length=1, max_length=255)

class UAVStatusCreate(UAVStatusBase):
    pass

class UAVStatus(UAVStatusBase):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True 