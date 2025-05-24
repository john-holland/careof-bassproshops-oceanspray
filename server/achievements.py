from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AchievementType(Enum):
    FISH_FOUND = "Fish Found!"
    UAV_UNSTUCK = "UAV Unstuck!"
    LOCAL_HERO = "Local Hero"
    GLOBAL_HERO = "Global Hero"
    LAUNCH_UAV = "Launch UAV!"
    SOLAR_CLEANER = "Solar Cleaner"
    SELLOUT = "Sellout!"

@dataclass
class Achievement:
    type: AchievementType
    description: str
    timestamp: datetime
    metadata: Dict = None

class AchievementService:
    def __init__(self):
        self.achievements: Dict[str, List[Achievement]] = {}  # profile_id -> achievements
        self.solar_readings: Dict[str, List[Dict]] = {}  # profile_id -> solar readings

    def add_achievement(self, profile_id: str, achievement_type: AchievementType, metadata: Dict = None) -> Achievement:
        """Add a new achievement for a profile."""
        if profile_id not in self.achievements:
            self.achievements[profile_id] = []
        
        achievement = Achievement(
            type=achievement_type,
            description=self._get_achievement_description(achievement_type),
            timestamp=datetime.utcnow(),
            metadata=metadata
        )
        
        self.achievements[profile_id].append(achievement)
        logger.info(f"New achievement unlocked: {achievement_type.value} for profile {profile_id}")
        return achievement

    def get_achievements(self, profile_id: str) -> List[Achievement]:
        """Get all achievements for a profile."""
        return self.achievements.get(profile_id, [])

    def check_fish_found(self, profile_id: str, fish_data: Dict) -> Optional[Achievement]:
        """Check if this is the first fish found by the profile."""
        if not any(a.type == AchievementType.FISH_FOUND for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.FISH_FOUND,
                metadata={"fish_data": fish_data}
            )
        return None

    def check_uav_unstuck(self, profile_id: str, uav_id: str, location: Dict) -> Optional[Achievement]:
        """Check if the profile helped a UAV out of a dangerous situation."""
        if not any(a.type == AchievementType.UAV_UNSTUCK for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.UAV_UNSTUCK,
                metadata={"uav_id": uav_id, "location": location}
            )
        return None

    def check_local_hero(self, profile_id: str, rank: int) -> Optional[Achievement]:
        """Check if the profile is at the top of the local leaderboard."""
        if rank == 1 and not any(a.type == AchievementType.LOCAL_HERO for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.LOCAL_HERO,
                metadata={"rank": rank}
            )
        return None

    def check_global_hero(self, profile_id: str, rank: int) -> Optional[Achievement]:
        """Check if the profile is at the top of the global leaderboard."""
        if rank == 1 and not any(a.type == AchievementType.GLOBAL_HERO for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.GLOBAL_HERO,
                metadata={"rank": rank}
            )
        return None

    def check_launch_uav(self, profile_id: str, uav_id: str) -> Optional[Achievement]:
        """Check if the profile has launched a purchased UAV."""
        if not any(a.type == AchievementType.LAUNCH_UAV for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.LAUNCH_UAV,
                metadata={"uav_id": uav_id}
            )
        return None

    def record_solar_reading(self, profile_id: str, reading: Dict) -> None:
        """Record a solar panel reading for verification."""
        if profile_id not in self.solar_readings:
            self.solar_readings[profile_id] = []
        self.solar_readings[profile_id].append({
            **reading,
            "timestamp": datetime.utcnow()
        })

    def check_solar_cleaner(self, profile_id: str) -> Optional[Achievement]:
        """Check if the profile has cleaned solar panels based on reading improvements."""
        if profile_id not in self.solar_readings:
            return None

        readings = self.solar_readings[profile_id]
        if len(readings) < 2:
            return None

        # Sort readings by timestamp
        readings.sort(key=lambda x: x["timestamp"])
        
        # Check if there's a significant improvement in efficiency
        for i in range(1, len(readings)):
            prev_reading = readings[i-1]
            curr_reading = readings[i]
            
            # If readings are within 48 hours and efficiency improved by at least 20%
            if (curr_reading["timestamp"] - prev_reading["timestamp"] <= timedelta(hours=48) and
                curr_reading["efficiency"] > prev_reading["efficiency"] * 1.2):
                
                if not any(a.type == AchievementType.SOLAR_CLEANER for a in self.achievements.get(profile_id, [])):
                    return self.add_achievement(
                        profile_id,
                        AchievementType.SOLAR_CLEANER,
                        metadata={
                            "improvement": curr_reading["efficiency"] - prev_reading["efficiency"],
                            "time_taken": str(curr_reading["timestamp"] - prev_reading["timestamp"])
                        }
                    )
        return None

    def check_sellout(self, profile_id: str, purchase_data: Dict) -> Optional[Achievement]:
        """Check if the profile has made their first purchase."""
        if not any(a.type == AchievementType.SELLOUT for a in self.achievements.get(profile_id, [])):
            return self.add_achievement(
                profile_id,
                AchievementType.SELLOUT,
                metadata={
                    "item": purchase_data.get("item_name"),
                    "amount": purchase_data.get("amount"),
                    "currency": purchase_data.get("currency")
                }
            )
        return None

    def _get_achievement_description(self, achievement_type: AchievementType) -> str:
        """Get the description for an achievement type."""
        descriptions = {
            AchievementType.FISH_FOUND: "First fish population detected!",
            AchievementType.UAV_UNSTUCK: "Helped a UAV out of a dangerous situation!",
            AchievementType.LOCAL_HERO: "Reached the top of the local leaderboard!",
            AchievementType.GLOBAL_HERO: "Reached the top of the global leaderboard!",
            AchievementType.LAUNCH_UAV: "Successfully launched your first UAV!",
            AchievementType.SOLAR_CLEANER: "Improved solar panel efficiency through maintenance!",
            AchievementType.SELLOUT: "Made your first purchase in the store!"
        }
        return descriptions.get(achievement_type, "Achievement unlocked!") 