from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from .models import Fish as FishModel, OceanHealth as OceanHealthModel, PressureTank as PressureTankModel, Base
from .schemas import Fish, FishCreate, OceanHealth, OceanHealthCreate, PressureTank, PressureTankCreate
from .database import get_db, engine
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/api/fishery/health")
async def health_check(db: Session = Depends(get_db)) -> Dict:
    """Health check endpoint that verifies database connectivity."""
    try:
        # Execute a simple query to verify database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: Database connection failed - {str(e)}"
        )

@app.post("/api/ocean/health")
async def check_ocean_health(coordinates: dict):
    if coordinates["latitude"] > 90 or coordinates["latitude"] < -90 or coordinates["longitude"] > 180 or coordinates["longitude"] < -180:
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    return {
        "metrics": {
            "temperature": 18.5,
            "salinity": 35.0,
            "ph": 8.1,
            "oxygen": 6.5
        },
        "status": "healthy"
    }

@app.post("/api/ocean/update")
async def update_ocean_health(data: dict):
    return {"status": "updated", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/ocean/history")
async def get_ocean_history(latitude: float, longitude: float, start_date: str, end_date: str):
    return [
        {
            "metrics": {
                "temperature": 18.5,
                "salinity": 35.0,
                "ph": 8.1,
                "oxygen": 6.5
            },
            "timestamp": (datetime.utcnow() - timedelta(days=i)).isoformat()
        }
        for i in range(7)
    ]

@app.get("/api/fishery/fish", response_model=List[Fish])
def get_fish(db: Session = Depends(get_db)):
    return db.query(FishModel).all()

@app.post("/api/fishery/fish", response_model=Fish)
def create_fish(fish: FishCreate, db: Session = Depends(get_db)):
    db_fish = FishModel(**fish.dict())
    db.add(db_fish)
    db.commit()
    db.refresh(db_fish)
    return db_fish

@app.get("/api/fishery/ocean-health", response_model=List[OceanHealth])
def get_ocean_health(db: Session = Depends(get_db)):
    return db.query(OceanHealthModel).all()

@app.post("/api/fishery/ocean-health", response_model=OceanHealth)
def create_ocean_health(ocean_health: OceanHealthCreate, db: Session = Depends(get_db)):
    db_ocean_health = OceanHealthModel(**ocean_health.dict())
    db.add(db_ocean_health)
    db.commit()
    db.refresh(db_ocean_health)
    return db_ocean_health

@app.get("/api/fishery/pressure-tank", response_model=List[PressureTank])
def get_pressure_tank(db: Session = Depends(get_db)):
    return db.query(PressureTankModel).all()

@app.post("/api/fishery/pressure-tank", response_model=PressureTank)
def create_pressure_tank(pressure_tank: PressureTankCreate, db: Session = Depends(get_db)):
    db_pressure_tank = PressureTankModel(**pressure_tank.dict())
    db.add(db_pressure_tank)
    db.commit()
    db.refresh(db_pressure_tank)
    return db_pressure_tank 