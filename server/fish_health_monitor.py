from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import geopandas as gpd
import pandas as pd
from geopy.distance import geodesic

class FishHealthMetrics(BaseModel):
    species: str
    population_health: float  # 0-100
    conservation_status: str
    habitat_quality: float  # 0-100
    reproduction_rate: float
    last_updated: datetime
    location: Dict[str, float]  # lat, lon
    data_source: str

class InvestmentIndex(BaseModel):
    name: str
    description: str
    risk_level: str  # low, medium, high
    expected_return: float
    species_included: List[str]
    performance_history: List[Dict[str, float]]  # timestamp, return

class SavingsAccount(BaseModel):
    balance: float
    interest_rate: float
    daily_interest: float
    last_interest_payment: datetime
    safety_threshold: float  # Percentage of balance to keep in savings
    auto_reinvest: bool
    investment_pots: Dict[str, float]  # Percentage allocations for different investment types

class MarketMetrics(BaseModel):
    timestamp: datetime
    market_health: float  # 0-100
    volatility: float
    trend: str  # "up", "down", "stable"
    recommended_action: str  # "invest", "divest", "hold"

class CommunityImpact(BaseModel):
    profile_id: str
    name: str
    location: Dict[str, float]  # lat, lon
    total_investment: float
    sustainable_catches: int
    conservation_contributions: float
    local_food_impact: float
    community_rating: float
    last_updated: datetime
    friends: List[str]

class LeaderboardEntry(BaseModel):
    profile_id: str
    name: str
    score: float
    rank: int
    impact_metrics: Dict[str, float]
    distance: Optional[float] = None  # For proximate leaderboard

class FishHealthMonitor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.fws_data_url = "https://fws.maps.arcgis.com/home/item.html?id=5b52826506d544de80d09d3ddf594be6#data"
        self.savings_accounts: Dict[str, SavingsAccount] = {}
        self.market_metrics: List[MarketMetrics] = []
        self.investment_indices = {
            "sustainable_fisheries": InvestmentIndex(
                name="Sustainable Fisheries Index",
                description="Diversified portfolio of well-managed fisheries",
                risk_level="low",
                expected_return=0.04,  # 4% annual return
                species_included=["Bass", "Trout", "Salmon"],
                performance_history=[]
            ),
            "conservation_focus": InvestmentIndex(
                name="Conservation Focus Fund",
                description="Investments in endangered species recovery",
                risk_level="medium",
                expected_return=0.06,  # 6% annual return
                species_included=["Atlantic Salmon", "Sturgeon"],
                performance_history=[]
            ),
            "local_food_security": InvestmentIndex(
                name="Local Food Security Fund",
                description="Support for sustainable local fishing communities",
                risk_level="low",
                expected_return=0.03,  # 3% annual return
                species_included=["Tilapia", "Catfish", "Bass"],
                performance_history=[]
            )
        }
        self.community_impacts: Dict[str, CommunityImpact] = {}
        self.friends_network: Dict[str, List[str]] = {}

    async def get_fish_health_data(self, species: str, location: Dict[str, float]) -> FishHealthMetrics:
        try:
            # Fetch data from FWS ArcGIS service
            # This is a placeholder for the actual API integration
            response = requests.get(self.fws_data_url)
            
            # Process the data and return metrics
            # For now, return mock data
            return FishHealthMetrics(
                species=species,
                population_health=85.0,
                conservation_status="Stable",
                habitat_quality=90.0,
                reproduction_rate=1.2,
                last_updated=datetime.now(),
                location=location,
                data_source="FWS ArcGIS"
            )
        except Exception as e:
            self.logger.error(f"Error fetching fish health data: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch fish health data")

    def calculate_investment_return(self, 
                                 species: str, 
                                 amount: float, 
                                 investment_type: str = "direct") -> float:
        """
        Calculate investment returns based on fish health and investment type
        """
        if investment_type == "direct":
            # Direct investment in specific species
            health_data = self.get_fish_health_data(species, {"lat": 0, "lon": 0})
            base_return = 0.05  # 5% base return
            
            # Adjust return based on population health
            health_factor = health_data.population_health / 100
            return base_return * health_factor
            
        elif investment_type in self.investment_indices:
            # Index fund investment
            index = self.investment_indices[investment_type]
            return index.expected_return
            
        else:
            raise ValueError(f"Unknown investment type: {investment_type}")

    def get_investment_options(self) -> List[InvestmentIndex]:
        return list(self.investment_indices.values())

    def update_index_performance(self, index_name: str, performance: float):
        if index_name in self.investment_indices:
            self.investment_indices[index_name].performance_history.append({
                "timestamp": datetime.now().isoformat(),
                "return": performance
            })

    def create_savings_account(self, profile_id: str) -> SavingsAccount:
        account = SavingsAccount(
            balance=0.0,
            interest_rate=0.04,  # 4% APY
            daily_interest=0.0,
            last_interest_payment=datetime.now(),
            safety_threshold=0.30,  # Keep 30% in savings
            auto_reinvest=True,
            investment_pots={
                "sustainable_fisheries": 0.25,
                "conservation_focus": 0.25,
                "local_food_security": 0.20
            }
        )
        self.savings_accounts[profile_id] = account
        return account

    def calculate_daily_interest(self, profile_id: str) -> float:
        account = self.savings_accounts.get(profile_id)
        if not account:
            raise HTTPException(status_code=404, detail="Savings account not found")
        
        days_since_last_payment = (datetime.now() - account.last_interest_payment).days
        daily_rate = account.interest_rate / 365
        interest = account.balance * daily_rate * days_since_last_payment
        
        account.daily_interest = interest
        account.balance += interest
        account.last_interest_payment = datetime.now()
        
        return interest

    def update_market_metrics(self):
        # Simulate market data collection
        current_health = 75.0  # This would come from real market data
        volatility = 0.15  # 15% volatility
        
        trend = "stable"
        if len(self.market_metrics) > 0:
            last_health = self.market_metrics[-1].market_health
            if current_health > last_health + 5:
                trend = "up"
            elif current_health < last_health - 5:
                trend = "down"
        
        recommended_action = "hold"
        if trend == "up" and current_health > 80:
            recommended_action = "invest"
        elif trend == "down" and current_health < 60:
            recommended_action = "divest"
        
        metrics = MarketMetrics(
            timestamp=datetime.now(),
            market_health=current_health,
            volatility=volatility,
            trend=trend,
            recommended_action=recommended_action
        )
        
        self.market_metrics.append(metrics)
        return metrics

    def auto_rebalance_portfolio(self, profile_id: str):
        account = self.savings_accounts.get(profile_id)
        if not account or not account.auto_reinvest:
            return
        
        market_metrics = self.update_market_metrics()
        
        if market_metrics.recommended_action == "divest":
            # Move funds back to savings
            for index_name in account.investment_pots:
                if index_name in self.investment_indices:
                    # Calculate amount to divest based on market conditions
                    divest_amount = account.balance * account.investment_pots[index_name] * 0.5
                    account.balance += divest_amount
                    self.logger.info(f"Auto-divested {divest_amount} from {index_name}")
        
        elif market_metrics.recommended_action == "invest":
            # Invest available funds according to allocation
            available_for_investment = account.balance * (1 - account.safety_threshold)
            for index_name, allocation in account.investment_pots.items():
                if index_name in self.investment_indices:
                    invest_amount = available_for_investment * allocation
                    account.balance -= invest_amount
                    self.logger.info(f"Auto-invested {invest_amount} in {index_name}")

    def get_savings_account(self, profile_id: str) -> SavingsAccount:
        if profile_id not in self.savings_accounts:
            return self.create_savings_account(profile_id)
        return self.savings_accounts[profile_id]

    def update_savings_settings(self, 
                              profile_id: str, 
                              safety_threshold: float,
                              auto_reinvest: bool,
                              investment_pots: Dict[str, float]) -> SavingsAccount:
        account = self.get_savings_account(profile_id)
        account.safety_threshold = safety_threshold
        account.auto_reinvest = auto_reinvest
        account.investment_pots = investment_pots
        return account

    def calculate_impact_score(self, impact: CommunityImpact) -> float:
        """Calculate overall impact score based on various metrics"""
        weights = {
            'investment': 0.3,
            'sustainable_catches': 0.25,
            'conservation': 0.25,
            'local_food': 0.2
        }
        
        score = (
            impact.total_investment * weights['investment'] +
            impact.sustainable_catches * 1000 * weights['sustainable_catches'] +
            impact.conservation_contributions * weights['conservation'] +
            impact.local_food_impact * weights['local_food']
        )
        
        return score

    def update_community_impact(self, profile_id: str, impact_data: Dict) -> CommunityImpact:
        """Update or create community impact data for a profile"""
        impact = CommunityImpact(
            profile_id=profile_id,
            name=impact_data.get('name', ''),
            location=impact_data.get('location', {'lat': 0, 'lon': 0}),
            total_investment=impact_data.get('total_investment', 0),
            sustainable_catches=impact_data.get('sustainable_catches', 0),
            conservation_contributions=impact_data.get('conservation_contributions', 0),
            local_food_impact=impact_data.get('local_food_impact', 0),
            community_rating=impact_data.get('community_rating', 0),
            last_updated=datetime.now(),
            friends=impact_data.get('friends', [])
        )
        
        self.community_impacts[profile_id] = impact
        return impact

    def get_global_leaderboard(self, limit: int = 100) -> List[LeaderboardEntry]:
        """Get global leaderboard sorted by impact score"""
        entries = []
        for profile_id, impact in self.community_impacts.items():
            score = self.calculate_impact_score(impact)
            entries.append(LeaderboardEntry(
                profile_id=profile_id,
                name=impact.name,
                score=score,
                rank=0,  # Will be set after sorting
                impact_metrics={
                    'investment': impact.total_investment,
                    'sustainable_catches': impact.sustainable_catches,
                    'conservation': impact.conservation_contributions,
                    'local_food': impact.local_food_impact
                }
            ))
        
        # Sort by score and assign ranks
        entries.sort(key=lambda x: x.score, reverse=True)
        for i, entry in enumerate(entries[:limit]):
            entry.rank = i + 1
        
        return entries[:limit]

    def get_local_leaderboard(self, location: Dict[str, float], radius_km: float = 50, limit: int = 100) -> List[LeaderboardEntry]:
        """Get leaderboard for profiles within a certain radius"""
        entries = []
        for profile_id, impact in self.community_impacts.items():
            distance = geodesic(
                (location['lat'], location['lon']),
                (impact.location['lat'], impact.location['lon'])
            ).kilometers
            
            if distance <= radius_km:
                score = self.calculate_impact_score(impact)
                entries.append(LeaderboardEntry(
                    profile_id=profile_id,
                    name=impact.name,
                    score=score,
                    rank=0,
                    impact_metrics={
                        'investment': impact.total_investment,
                        'sustainable_catches': impact.sustainable_catches,
                        'conservation': impact.conservation_contributions,
                        'local_food': impact.local_food_impact
                    },
                    distance=distance
                ))
        
        # Sort by score and assign ranks
        entries.sort(key=lambda x: x.score, reverse=True)
        for i, entry in enumerate(entries[:limit]):
            entry.rank = i + 1
        
        return entries[:limit]

    def get_friends_leaderboard(self, profile_id: str, limit: int = 100) -> List[LeaderboardEntry]:
        """Get leaderboard for friends of a profile"""
        if profile_id not in self.community_impacts:
            return []
        
        friends = self.community_impacts[profile_id].friends
        entries = []
        
        for friend_id in friends:
            if friend_id in self.community_impacts:
                impact = self.community_impacts[friend_id]
                score = self.calculate_impact_score(impact)
                entries.append(LeaderboardEntry(
                    profile_id=friend_id,
                    name=impact.name,
                    score=score,
                    rank=0,
                    impact_metrics={
                        'investment': impact.total_investment,
                        'sustainable_catches': impact.sustainable_catches,
                        'conservation': impact.conservation_contributions,
                        'local_food': impact.local_food_impact
                    }
                ))
        
        # Sort by score and assign ranks
        entries.sort(key=lambda x: x.score, reverse=True)
        for i, entry in enumerate(entries[:limit]):
            entry.rank = i + 1
        
        return entries[:limit]

    def add_friend(self, profile_id: str, friend_id: str) -> bool:
        """Add a friend connection between two profiles"""
        if profile_id not in self.community_impacts or friend_id not in self.community_impacts:
            return False
        
        if friend_id not in self.community_impacts[profile_id].friends:
            self.community_impacts[profile_id].friends.append(friend_id)
        if profile_id not in self.community_impacts[friend_id].friends:
            self.community_impacts[friend_id].friends.append(profile_id)
        
        return True

# FastAPI Router
router = FastAPI()
monitor = FishHealthMonitor()

@router.get("/fish-health/{species}", response_model=FishHealthMetrics)
async def get_fish_health(species: str, lat: float, lon: float):
    return await monitor.get_fish_health_data(species, {"lat": lat, "lon": lon})

@router.get("/investment-indices", response_model=List[InvestmentIndex])
async def get_investment_indices():
    return monitor.get_investment_options()

@router.post("/calculate-return")
async def calculate_return(species: str, amount: float, investment_type: str):
    return {
        "return": monitor.calculate_investment_return(species, amount, investment_type)
    }

@router.get("/savings/{profile_id}", response_model=SavingsAccount)
async def get_savings_account(profile_id: str):
    return monitor.get_savings_account(profile_id)

@router.post("/savings/{profile_id}/settings")
async def update_savings_settings(
    profile_id: str,
    safety_threshold: float,
    auto_reinvest: bool,
    investment_pots: Dict[str, float]
):
    return monitor.update_savings_settings(
        profile_id,
        safety_threshold,
        auto_reinvest,
        investment_pots
    )

@router.get("/market-metrics", response_model=MarketMetrics)
async def get_market_metrics():
    return monitor.update_market_metrics()

@router.post("/savings/{profile_id}/rebalance")
async def rebalance_portfolio(profile_id: str):
    monitor.auto_rebalance_portfolio(profile_id)
    return {"status": "success", "message": "Portfolio rebalanced"}

@router.get("/community-impact/{profile_id}", response_model=CommunityImpact)
async def get_community_impact(profile_id: str):
    if profile_id not in monitor.community_impacts:
        raise HTTPException(status_code=404, detail="Profile not found")
    return monitor.community_impacts[profile_id]

@router.post("/community-impact/{profile_id}")
async def update_community_impact(profile_id: str, impact_data: Dict):
    return monitor.update_community_impact(profile_id, impact_data)

@router.get("/leaderboard/global", response_model=List[LeaderboardEntry])
async def get_global_leaderboard(limit: int = 100):
    return monitor.get_global_leaderboard(limit)

@router.get("/leaderboard/local", response_model=List[LeaderboardEntry])
async def get_local_leaderboard(lat: float, lon: float, radius_km: float = 50, limit: int = 100):
    return monitor.get_local_leaderboard({"lat": lat, "lon": lon}, radius_km, limit)

@router.get("/leaderboard/friends/{profile_id}", response_model=List[LeaderboardEntry])
async def get_friends_leaderboard(profile_id: str, limit: int = 100):
    return monitor.get_friends_leaderboard(profile_id, limit)

@router.post("/friends/{profile_id}/{friend_id}")
async def add_friend(profile_id: str, friend_id: str):
    success = monitor.add_friend(profile_id, friend_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add friend")
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8001) 