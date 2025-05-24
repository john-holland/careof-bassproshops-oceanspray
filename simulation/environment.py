import numpy as np
from dataclasses import dataclass
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

@dataclass
class WaterQuality:
    ph: float
    oxygen: float
    salinity: float
    temperature: float

class Environment:
    def __init__(self):
        """Initialize the environment simulation."""
        self.water_quality = WaterQuality(
            ph=7.0,  # Neutral pH
            oxygen=8.0,  # mg/L
            salinity=35.0,  # ppt (parts per thousand)
            temperature=15.0  # °C
        )
        
    def update_conditions(self):
        """Update environmental conditions."""
        # Simulate natural variations
        self.water_quality.ph += np.random.normal(0, 0.1)
        self.water_quality.ph = np.clip(self.water_quality.ph, 6.5, 8.5)
        
        self.water_quality.oxygen += np.random.normal(0, 0.2)
        self.water_quality.oxygen = np.clip(self.water_quality.oxygen, 6.0, 10.0)
        
        self.water_quality.salinity += np.random.normal(0, 0.5)
        self.water_quality.salinity = np.clip(self.water_quality.salinity, 30.0, 40.0)
        
        self.water_quality.temperature += np.random.normal(0, 0.3)
        self.water_quality.temperature = np.clip(self.water_quality.temperature, 10.0, 20.0)
    
    def get_temperature(self) -> float:
        """Get current water temperature."""
        return self.water_quality.temperature
    
    def get_ph(self) -> float:
        """Get current water pH."""
        return self.water_quality.ph
    
    def get_oxygen_level(self) -> float:
        """Get current oxygen level."""
        return self.water_quality.oxygen
    
    def get_salinity(self) -> float:
        """Get current water salinity."""
        return self.water_quality.salinity
    
    def get_statistics(self) -> Dict:
        """Get environment statistics."""
        return {
            'temperature': self.water_quality.temperature,
            'ph': self.water_quality.ph,
            'oxygen': self.water_quality.oxygen,
            'salinity': self.water_quality.salinity
        } 