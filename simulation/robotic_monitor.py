#!/usr/bin/env python3

import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

@dataclass
class AUVState:
    """Represents the state of an Autonomous Underwater Vehicle."""
    position: np.ndarray  # [x, y, z] coordinates
    velocity: np.ndarray  # [vx, vy, vz] velocity components
    battery_level: float  # 0.0 to 1.0
    sensors_active: Dict[str, bool]
    current_mission: str

class RoboticMonitor:
    def __init__(self, num_robots: int = 3):
        """Initialize the robotic monitoring system.
        
        Args:
            num_robots: Number of AUVs to deploy in the simulation
        """
        self.num_robots = num_robots
        self.robots = self._initialize_robots()
        self.fish_tracking_data = {}
        
    def _initialize_robots(self) -> List[AUVState]:
        """Initialize the AUVs with random starting positions."""
        robots = []
        for i in range(self.num_robots):
            # Random initial position within tank bounds
            position = np.random.uniform(
                low=[0, 0, 0],
                high=[10, 10, 5],  # Tank dimensions in meters
                size=3
            )
            robots.append(AUVState(
                position=position,
                velocity=np.zeros(3),
                battery_level=1.0,
                sensors_active={
                    "camera": True,
                    "sonar": True,
                    "pressure": True,
                    "magnetic": True
                },
                current_mission="patrol"
            ))
        return robots

    def update_robot_positions(self, fish_positions: List[np.ndarray]):
        """Update AUV positions based on fish locations and swarm behavior.
        
        Args:
            fish_positions: List of fish positions in the tank
        """
        for robot in self.robots:
            if robot.battery_level < 0.1:
                # Return to charging station
                self._return_to_charging(robot)
                continue
                
            # Calculate nearest fish
            nearest_fish = self._find_nearest_fish(robot.position, fish_positions)
            
            # Update velocity based on nearest fish and other robots
            self._update_velocity(robot, nearest_fish)
            
            # Update position
            robot.position += robot.velocity
            
            # Decrease battery level
            robot.battery_level -= 0.001  # Battery drain rate
            
            # Ensure position stays within tank bounds
            self._enforce_boundaries(robot)

    def _find_nearest_fish(self, robot_pos: np.ndarray, fish_positions: List[np.ndarray]) -> np.ndarray:
        """Find the nearest fish to the robot."""
        if not fish_positions:
            return None
        distances = [np.linalg.norm(robot_pos - fish_pos) for fish_pos in fish_positions]
        return fish_positions[np.argmin(distances)]

    def _update_velocity(self, robot: AUVState, nearest_fish: np.ndarray):
        """Update robot velocity based on nearest fish and swarm behavior."""
        if nearest_fish is None:
            # Random movement if no fish nearby
            robot.velocity = np.random.normal(0, 0.1, size=3)
            return

        # Calculate desired velocity towards nearest fish
        desired_velocity = nearest_fish - robot.position
        desired_velocity = desired_velocity / np.linalg.norm(desired_velocity) * 0.5  # Normalize and scale

        # Add swarm behavior (avoid other robots)
        swarm_velocity = self._calculate_swarm_velocity(robot)
        
        # Combine velocities
        robot.velocity = 0.7 * desired_velocity + 0.3 * swarm_velocity

    def _calculate_swarm_velocity(self, current_robot: AUVState) -> np.ndarray:
        """Calculate velocity adjustment based on other robots' positions."""
        swarm_velocity = np.zeros(3)
        for robot in self.robots:
            if robot is current_robot:
                continue
            # Repulsion force from other robots
            diff = current_robot.position - robot.position
            distance = np.linalg.norm(diff)
            if distance < 2.0:  # Minimum separation distance
                swarm_velocity += diff / (distance ** 2)
        return swarm_velocity

    def _enforce_boundaries(self, robot: AUVState):
        """Ensure robot stays within tank boundaries."""
        # Tank boundaries
        bounds = {
            'x': (0, 10),
            'y': (0, 10),
            'z': (0, 5)
        }
        
        for i, (axis, (min_val, max_val)) in enumerate(bounds.items()):
            if robot.position[i] < min_val:
                robot.position[i] = min_val
                robot.velocity[i] *= -0.5  # Bounce off wall
            elif robot.position[i] > max_val:
                robot.position[i] = max_val
                robot.velocity[i] *= -0.5  # Bounce off wall

    def _return_to_charging(self, robot: AUVState):
        """Return robot to charging station."""
        charging_station = np.array([0, 0, 0])  # Charging station position
        direction = charging_station - robot.position
        if np.linalg.norm(direction) > 0.1:
            direction = direction / np.linalg.norm(direction)
            robot.velocity = direction * 0.3
            robot.position += robot.velocity
        else:
            # At charging station
            robot.battery_level = min(1.0, robot.battery_level + 0.01)  # Charging rate

    def collect_fish_data(self, fish_positions: List[np.ndarray], fish_ids: List[str]):
        """Collect data about fish positions and behavior."""
        for i, fish_pos in enumerate(fish_positions):
            fish_id = fish_ids[i]
            if fish_id not in self.fish_tracking_data:
                self.fish_tracking_data[fish_id] = []
            
            # Find nearest robot to this fish
            nearest_robot = min(
                self.robots,
                key=lambda r: np.linalg.norm(r.position - fish_pos)
            )
            
            # Record data if robot is close enough
            if np.linalg.norm(nearest_robot.position - fish_pos) < 2.0:
                self.fish_tracking_data[fish_id].append({
                    'position': fish_pos,
                    'timestamp': np.datetime64('now'),
                    'nearest_robot_id': id(nearest_robot),
                    'robot_sensors': nearest_robot.sensors_active
                })

    def get_statistics(self) -> Dict:
        """Get statistics about the robotic monitoring system."""
        return {
            'active_robots': sum(1 for r in self.robots if r.battery_level > 0.1),
            'average_battery': np.mean([r.battery_level for r in self.robots]),
            'tracked_fish': len(self.fish_tracking_data),
            'total_observations': sum(len(data) for data in self.fish_tracking_data.values())
        } 