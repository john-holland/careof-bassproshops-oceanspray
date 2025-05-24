#!/usr/bin/env python3

import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import numpy as np
from dotenv import load_dotenv

# Import simulation components
from simulation.pressure_tank import PressureTank
from simulation.environment import Environment
from simulation.fish_behavior import FishBehavior
from simulation.robotic_monitor import RoboticMonitor
from monitoring.sensors import SensorManager
from monitoring.water_quality import WaterQualityMonitor
from investment.annuity import AnnuityManager
from investment.distribution import DistributionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('simulation.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class DeepSeaFishSimulation:
    def __init__(self, config_path: str = "config/settings.py"):
        """Initialize the deep sea fish farming simulation."""
        load_dotenv()
        self.config_path = config_path
        self.initialize_components()
        
    def initialize_components(self):
        """Initialize all simulation components."""
        try:
            # Initialize core simulation components
            self.pressure_tank = PressureTank()
            self.environment = Environment()
            self.fish_behavior = FishBehavior()
            self.robotic_monitor = RoboticMonitor(num_robots=3)  # Initialize with 3 AUVs
            
            # Initialize monitoring systems
            self.sensor_manager = SensorManager()
            self.water_quality = WaterQualityMonitor()
            
            # Initialize investment systems
            self.annuity_manager = AnnuityManager()
            self.distribution_manager = DistributionManager()
            
            logger.info("All components initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing components: {str(e)}")
            raise

    def run_simulation(self, duration_hours: int = 24):
        """Run the main simulation loop."""
        logger.info(f"Starting simulation for {duration_hours} hours")
        
        try:
            for hour in range(duration_hours):
                # Update pressure and environment
                self.pressure_tank.update_pressure()
                self.environment.update_conditions()
                
                # Get fish positions and update robotic monitoring
                fish_positions = self.fish_behavior.get_fish_positions()
                fish_ids = self.fish_behavior.get_fish_ids()
                self.robotic_monitor.update_robot_positions(fish_positions)
                self.robotic_monitor.collect_fish_data(fish_positions, fish_ids)
                
                # Monitor fish behavior
                self.fish_behavior.analyze_behavior()
                
                # Collect sensor data
                sensor_data = self.sensor_manager.collect_data()
                water_quality_data = self.water_quality.analyze()
                
                # Update investment calculations
                self.annuity_manager.update_calculations()
                self.distribution_manager.process_distributions()
                
                # Log progress
                logger.info(f"Hour {hour + 1}/{duration_hours} completed")
                
        except Exception as e:
            logger.error(f"Error during simulation: {str(e)}")
            raise

    def generate_report(self) -> Dict:
        """Generate a comprehensive simulation report."""
        return {
            "timestamp": datetime.now().isoformat(),
            "pressure_stats": self.pressure_tank.get_statistics(),
            "environment_stats": self.environment.get_statistics(),
            "fish_behavior_stats": self.fish_behavior.get_statistics(),
            "robotic_monitor_stats": self.robotic_monitor.get_statistics(),
            "water_quality_stats": self.water_quality.get_statistics(),
            "investment_stats": {
                "annuity": self.annuity_manager.get_statistics(),
                "distribution": self.distribution_manager.get_statistics()
            }
        }

def main():
    """Main entry point for the simulation."""
    try:
        # Create necessary directories
        Path("logs").mkdir(exist_ok=True)
        Path("data").mkdir(exist_ok=True)
        
        # Initialize and run simulation
        simulation = DeepSeaFishSimulation()
        simulation.run_simulation()
        
        # Generate and save report
        report = simulation.generate_report()
        logger.info("Simulation completed successfully")
        
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        raise

if __name__ == "__main__":
    main() 