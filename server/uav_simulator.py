from dataclasses import dataclass
from typing import List, Dict, Optional
import random
import time
from datetime import datetime
import math

@dataclass
class GPSPoint:
    lat: float
    lon: float
    alt: float

@dataclass
class Fish:
    id: str
    position: GPSPoint
    species: str
    size: float
    last_seen: datetime

@dataclass
class WaterQuality:
    temperature: float
    ph: float
    oxygen: float
    salinity: float
    turbidity: float

@dataclass
class UAVStatus:
    position: GPSPoint
    battery_level: float
    water_quality: WaterQuality
    is_operational: bool
    last_maintenance: datetime

class GPSFence:
    def __init__(self, center: GPSPoint, radius_meters: float):
        self.center = center
        self.radius = radius_meters

    def is_within_bounds(self, point: GPSPoint) -> bool:
        # Haversine formula for distance calculation
        R = 6371000  # Earth's radius in meters
        lat1, lon1 = math.radians(self.center.lat), math.radians(self.center.lon)
        lat2, lon2 = math.radians(point.lat), math.radians(point.lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return distance <= self.radius

class FishFinder:
    def __init__(self, detection_range_meters: float):
        self.detection_range = detection_range_meters
        self.last_scan: Optional[datetime] = None
        self.scan_interval = 5  # seconds

    def can_scan(self) -> bool:
        if not self.last_scan:
            return True
        return (datetime.now() - self.last_scan).total_seconds() >= self.scan_interval

    def scan(self, uav_position: GPSPoint, fish_population: List[Fish]) -> List[Fish]:
        if not self.can_scan():
            return []
        
        self.last_scan = datetime.now()
        detected_fish = []
        
        for fish in fish_population:
            # Simple distance calculation (in a real system, we'd use proper 3D distance)
            distance = math.sqrt(
                (fish.position.lat - uav_position.lat)**2 +
                (fish.position.lon - uav_position.lon)**2
            ) * 111000  # rough conversion to meters
            
            if distance <= self.detection_range:
                detected_fish.append(fish)
        
        return detected_fish

class UAVSimulator:
    def __init__(self):
        self.status = UAVStatus(
            position=GPSPoint(0.0, 0.0, 0.0),
            battery_level=1.0,
            water_quality=WaterQuality(25.0, 7.0, 8.0, 35.0, 1.0),
            is_operational=True,
            last_maintenance=datetime.now()
        )
        
        self.fence = GPSFence(
            center=GPSPoint(0.0, 0.0, 0.0),
            radius_meters=1000
        )
        
        self.fish_finder = FishFinder(detection_range_meters=50)
        self.fish_population: List[Fish] = []
        self.initialize_fish_population()

    def initialize_fish_population(self):
        species = ["Bass", "Trout", "Salmon", "Tilapia"]
        for i in range(50):  # Start with 50 fish
            self.fish_population.append(Fish(
                id=f"fish_{i}",
                position=GPSPoint(
                    lat=random.uniform(-0.01, 0.01),
                    lon=random.uniform(-0.01, 0.01),
                    alt=random.uniform(-5, -1)
                ),
                species=random.choice(species),
                size=random.uniform(0.2, 1.0),
                last_seen=datetime.now()
            ))

    def update_status(self):
        # Simulate battery drain
        self.status.battery_level = max(0.0, self.status.battery_level - 0.001)
        
        # Simulate water quality changes
        self.status.water_quality.temperature += random.uniform(-0.1, 0.1)
        self.status.water_quality.ph += random.uniform(-0.01, 0.01)
        self.status.water_quality.oxygen += random.uniform(-0.1, 0.1)
        
        # Check if UAV is within fence
        if not self.fence.is_within_bounds(self.status.position):
            self.status.is_operational = False
        
        # Update fish positions
        for fish in self.fish_population:
            fish.position.lat += random.uniform(-0.0001, 0.0001)
            fish.position.lon += random.uniform(-0.0001, 0.0001)
            fish.position.alt += random.uniform(-0.1, 0.1)

    def get_detected_fish(self) -> List[Fish]:
        return self.fish_finder.scan(self.status.position, self.fish_population)

    def get_status(self) -> Dict:
        return {
            "position": {
                "lat": self.status.position.lat,
                "lon": self.status.position.lon,
                "alt": self.status.position.alt
            },
            "battery_level": self.status.battery_level,
            "water_quality": {
                "temperature": self.status.water_quality.temperature,
                "ph": self.status.water_quality.ph,
                "oxygen": self.status.water_quality.oxygen,
                "salinity": self.status.water_quality.salinity,
                "turbidity": self.status.water_quality.turbidity
            },
            "is_operational": self.status.is_operational,
            "last_maintenance": self.status.last_maintenance.isoformat()
        } 