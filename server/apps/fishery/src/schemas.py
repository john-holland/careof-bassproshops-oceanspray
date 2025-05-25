from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FishBase(BaseModel):
    species: str
    size: float
    weight: float
    location: str
    is_sustainable: bool = True

class FishCreate(FishBase):
    pass

class Fish(FishBase):
    id: int
    caught_at: datetime

    class Config:
        from_attributes = True

class OceanHealthBase(BaseModel):
    temperature: float
    salinity: float
    ph_level: float
    pollution_level: float
    location: str

class OceanHealthCreate(OceanHealthBase):
    pass

class OceanHealth(OceanHealthBase):
    id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

class PressureTankBase(BaseModel):
    pressure: float
    volume: float
    is_operational: bool = True

class PressureTankCreate(PressureTankBase):
    pass

class PressureTank(PressureTankBase):
    id: int
    last_maintenance: datetime

    class Config:
        from_attributes = True 