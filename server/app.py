from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import asyncio
from uav_simulator import UAVSimulator, Fish

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize UAV simulator
uav = UAVSimulator()

class FishResponse(BaseModel):
    id: str
    position: Dict[str, float]
    species: str
    size: float
    last_seen: str

class UAVStatusResponse(BaseModel):
    position: Dict[str, float]
    battery_level: float
    water_quality: Dict[str, float]
    is_operational: bool
    last_maintenance: str

@app.get("/api/uav/status")
async def get_uav_status():
    uav.update_status()
    return uav.get_status()

@app.get("/api/uav/fish")
async def get_detected_fish():
    detected_fish = uav.get_detected_fish()
    return [
        {
            "id": fish.id,
            "position": {
                "lat": fish.position.lat,
                "lon": fish.position.lon,
                "alt": fish.position.alt
            },
            "species": fish.species,
            "size": fish.size,
            "last_seen": fish.last_seen.isoformat()
        }
        for fish in detected_fish
    ]

@app.post("/api/uav/move")
async def move_uav(lat: float, lon: float, alt: float):
    uav.status.position.lat = lat
    uav.status.position.lon = lon
    uav.status.position.alt = alt
    return {"message": "UAV position updated"}

@app.post("/api/uav/maintenance")
async def perform_maintenance():
    uav.status.last_maintenance = datetime.now()
    uav.status.battery_level = 1.0
    uav.status.is_operational = True
    return {"message": "Maintenance completed"}

# WebSocket endpoint for real-time updates
@app.websocket("/ws/uav")
async def websocket_endpoint(websocket):
    await websocket.accept()
    try:
        while True:
            uav.update_status()
            status = uav.get_status()
            detected_fish = uav.get_detected_fish()
            
            await websocket.send_json({
                "status": status,
                "detected_fish": [
                    {
                        "id": fish.id,
                        "position": {
                            "lat": fish.position.lat,
                            "lon": fish.position.lon,
                            "alt": fish.position.alt
                        },
                        "species": fish.species,
                        "size": fish.size,
                        "last_seen": fish.last_seen.isoformat()
                    }
                    for fish in detected_fish
                ]
            })
            
            await asyncio.sleep(1)  # Update every second
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 