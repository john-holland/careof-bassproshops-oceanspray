from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
import asyncio
from .achievements import AchievementService
import os
import uuid
from square.client import Client
import logging

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
achievement_service = AchievementService()

# Store active WebSocket connections
active_connections: List[WebSocket] = []

logger = logging.getLogger(__name__)

@app.websocket("/ws/achievements")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_achievement(achievement: Dict):
    """Broadcast a new achievement to all connected clients."""
    for connection in active_connections:
        try:
            await connection.send_text(json.dumps(achievement))
        except:
            active_connections.remove(connection)

# Achievement endpoints
@app.get("/api/achievements/{profile_id}")
async def get_achievements(profile_id: str):
    """Get all achievements for a profile."""
    return achievement_service.get_achievements(profile_id)

@app.post("/api/achievements/fish-found/{profile_id}")
async def record_fish_found(profile_id: str, fish_data: Dict):
    """Record a fish found achievement."""
    achievement = achievement_service.check_fish_found(profile_id, fish_data)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/uav-unstuck/{profile_id}")
async def record_uav_unstuck(profile_id: str, uav_id: str, location: Dict):
    """Record a UAV unstuck achievement."""
    achievement = achievement_service.check_uav_unstuck(profile_id, uav_id, location)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/local-hero/{profile_id}")
async def record_local_hero(profile_id: str, rank: int):
    """Record a local hero achievement."""
    achievement = achievement_service.check_local_hero(profile_id, rank)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/global-hero/{profile_id}")
async def record_global_hero(profile_id: str, rank: int):
    """Record a global hero achievement."""
    achievement = achievement_service.check_global_hero(profile_id, rank)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/launch-uav/{profile_id}")
async def record_launch_uav(profile_id: str, uav_id: str):
    """Record a launch UAV achievement."""
    achievement = achievement_service.check_launch_uav(profile_id, uav_id)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/solar-reading/{profile_id}")
async def record_solar_reading(profile_id: str, reading: Dict):
    """Record a solar panel reading and check for achievement."""
    achievement_service.record_solar_reading(profile_id, reading)
    achievement = achievement_service.check_solar_cleaner(profile_id)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

@app.post("/api/achievements/sellout/{profile_id}")
async def record_sellout(profile_id: str, purchase_data: Dict):
    """Record a sellout achievement."""
    achievement = achievement_service.check_sellout(profile_id, purchase_data)
    if achievement:
        await broadcast_achievement({
            "type": achievement.type.value,
            "description": achievement.description,
            "timestamp": achievement.timestamp.isoformat(),
            "metadata": achievement.metadata
        })
    return achievement

# Payment endpoints
@app.post("/api/payments/square")
async def process_square_payment(payment_data: Dict):
    """Process a payment through Square."""
    try:
        # Initialize Square client
        square_client = Client(
            access_token=os.getenv('SQUARE_ACCESS_TOKEN'),
            environment='sandbox'  # Change to 'production' for live environment
        )

        # Create payment
        payment = square_client.payments.create_payment(
            body={
                'source_id': payment_data['source_id'],
                'amount_money': {
                    'amount': int(payment_data['amount'] * 100),  # Convert to cents
                    'currency': 'USD'
                },
                'idempotency_key': str(uuid.uuid4())
            }
        )

        return {"success": True, "payment_id": payment.body['payment']['id']}
    except Exception as e:
        logger.error(f"Square payment error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/payments/google")
async def process_google_payment(payment_data: Dict):
    """Process a payment through Google Pay."""
    try:
        # Initialize Google Pay client
        # Note: This is a placeholder. You'll need to implement the actual Google Pay integration
        # using their official SDK and following their implementation guidelines
        return {"success": True, "payment_id": str(uuid.uuid4())}
    except Exception as e:
        logger.error(f"Google Pay error: {str(e)}")
        return {"success": False, "error": str(e)} 