from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from .models import UAVDeployment, UAVStatus
from .database import get_db

app = FastAPI()

@app.post("/api/uav/deploy", response_model=UAVStatus)
def deploy_uav(deployment: UAVDeployment, db: Session = Depends(get_db)):
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    status = UAVStatus(status="Deployed", battery_level=100.0, location=deployment.location)
    db.add(status)
    db.commit()
    db.refresh(status)
    return status

@app.get("/api/uav/status", response_model=List[UAVStatus])
def get_uav_status(db: Session = Depends(get_db)):
    return db.query(UAVStatus).all() 