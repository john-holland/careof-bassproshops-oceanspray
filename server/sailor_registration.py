from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime
import json
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid

# Models
class Investment(BaseModel):
    species: str
    amount: float
    performance: float
    timestamp: datetime

class Earnings(BaseModel):
    immediate: float
    invested: float

class SailorProfile(BaseModel):
    id: str
    name: str
    license: str
    experience: int
    preferred_species: List[str]
    investment_portfolio: List[Investment]
    earnings: Earnings
    created_at: datetime
    updated_at: datetime

class InvestmentRequest(BaseModel):
    species: str
    amount: float

class PayoutRequest(BaseModel):
    amount: float

# Service
class SailorRegistrationService:
    def __init__(self):
        self.profiles: Dict[str, SailorProfile] = {}
        self.logger = logging.getLogger(__name__)

    def create_profile(self, name: str, license: str) -> SailorProfile:
        profile_id = str(uuid.uuid4())
        now = datetime.now()
        
        profile = SailorProfile(
            id=profile_id,
            name=name,
            license=license,
            experience=0,
            preferred_species=[],
            investment_portfolio=[],
            earnings=Earnings(immediate=0.0, invested=0.0),
            created_at=now,
            updated_at=now
        )
        
        self.profiles[profile_id] = profile
        self.logger.info(f"Created new sailor profile: {profile_id}")
        return profile

    def get_profile(self, profile_id: str) -> SailorProfile:
        if profile_id not in self.profiles:
            raise HTTPException(status_code=404, detail="Profile not found")
        return self.profiles[profile_id]

    def update_profile(self, profile_id: str, updates: Dict) -> SailorProfile:
        if profile_id not in self.profiles:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = self.profiles[profile_id]
        for key, value in updates.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        profile.updated_at = datetime.now()
        self.profiles[profile_id] = profile
        return profile

    def process_investment(self, profile_id: str, investment: InvestmentRequest) -> Investment:
        profile = self.get_profile(profile_id)
        
        # Calculate performance based on species population health
        # This would typically come from the fish population monitoring system
        performance = self._calculate_investment_performance(investment.species)
        
        new_investment = Investment(
            species=investment.species,
            amount=investment.amount,
            performance=performance,
            timestamp=datetime.now()
        )
        
        profile.investment_portfolio.append(new_investment)
        profile.earnings.invested += investment.amount
        profile.earnings.immediate -= investment.amount
        
        self.profiles[profile_id] = profile
        return new_investment

    def process_payout(self, profile_id: str, payout: PayoutRequest) -> float:
        profile = self.get_profile(profile_id)
        
        if profile.earnings.immediate < payout.amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds for payout"
            )
        
        profile.earnings.immediate -= payout.amount
        self.profiles[profile_id] = profile
        return payout.amount

    def _calculate_investment_performance(self, species: str) -> float:
        # This would integrate with the fish population monitoring system
        # For now, return a mock performance value
        return 5.0  # 5% return

# FastAPI Router
router = FastAPI()
service = SailorRegistrationService()

@router.post("/sailors", response_model=SailorProfile)
async def create_sailor(name: str, license: str):
    return service.create_profile(name, license)

@router.get("/sailors/{profile_id}", response_model=SailorProfile)
async def get_sailor(profile_id: str):
    return service.get_profile(profile_id)

@router.put("/sailors/{profile_id}", response_model=SailorProfile)
async def update_sailor(profile_id: str, updates: Dict):
    return service.update_profile(profile_id, updates)

@router.post("/sailors/{profile_id}/invest", response_model=Investment)
async def invest(profile_id: str, investment: InvestmentRequest):
    return service.process_investment(profile_id, investment)

@router.post("/sailors/{profile_id}/payout", response_model=float)
async def payout(profile_id: str, payout: PayoutRequest):
    return service.process_payout(profile_id, payout)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000) 