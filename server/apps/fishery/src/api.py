from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from .models import Fish, OceanHealth, PressureTank
from .database import get_db

app = FastAPI()

@app.get("/api/fishery/fish", response_model=List[Fish])
def get_fish(db: Session = Depends(get_db)):
    return db.query(Fish).all()

@app.post("/api/fishery/fish", response_model=Fish)
def create_fish(fish: Fish, db: Session = Depends(get_db)):
    db.add(fish)
    db.commit()
    db.refresh(fish)
    return fish

@app.get("/api/fishery/ocean-health", response_model=List[OceanHealth])
def get_ocean_health(db: Session = Depends(get_db)):
    return db.query(OceanHealth).all()

@app.post("/api/fishery/ocean-health", response_model=OceanHealth)
def create_ocean_health(ocean_health: OceanHealth, db: Session = Depends(get_db)):
    db.add(ocean_health)
    db.commit()
    db.refresh(ocean_health)
    return ocean_health

@app.get("/api/fishery/pressure-tank", response_model=List[PressureTank])
def get_pressure_tank(db: Session = Depends(get_db)):
    return db.query(PressureTank).all()

@app.post("/api/fishery/pressure-tank", response_model=PressureTank)
def create_pressure_tank(pressure_tank: PressureTank, db: Session = Depends(get_db)):
    db.add(pressure_tank)
    db.commit()
    db.refresh(pressure_tank)
    return pressure_tank 