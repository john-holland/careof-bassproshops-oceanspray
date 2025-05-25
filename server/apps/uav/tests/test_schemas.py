import pytest
from datetime import datetime
from ..src.schemas import (
    FlightPlanCreate, EnvironmentalTestCreate, FisheryCreate,
    FishTrackingCreate, AchievementCreate, StallCreate,
    MovementGPSLogCreate, MaintenanceScheduleCreate,
    DestinationCreate, UnstuckInteractionCreate, PowerReadingCreate
)

# Test data
valid_flight_plan = {
    "plan_name": "Test Flight",
    "source": "DJI",
    "plan_data": {"coordinates": [[0, 0], [1, 1]]}
}

valid_environmental_test = {
    "test_name": "Water Quality Test",
    "quality_score": 85.5,
    "notes": "Test notes"
}

valid_fishery = {
    "name": "Test Fishery",
    "location": "Test Location",
    "contact_info": {"phone": "123-456-7890"},
    "operating_hours": {"weekday": "9-5"}
}

valid_fish_tracking = {
    "fish_type": "Tuna",
    "tracking_data": {"depth": 50},
    "location_lat": 35.0,
    "location_lng": -120.0,
    "metadata": {"temperature": 18.5}
}

valid_achievement = {
    "name": "First Catch",
    "description": "Catch your first fish",
    "criteria": {"fish_count": 1},
    "points": 100,
    "user_id": 1
}

valid_stall = {
    "location": "Dock A",
    "stall_type": "Fishing",
    "status": "active",
    "capacity": 10,
    "current_occupancy": 5
}

valid_gps_log = {
    "latitude": 35.0,
    "longitude": -120.0,
    "notes": "Test location"
}

valid_maintenance = {
    "schedule_name": "Monthly Check",
    "maintenance_date": datetime.utcnow(),
    "description": "Regular maintenance"
}

valid_destination = {
    "name": "Fishing Spot A",
    "location": "Ocean",
    "coordinates": {"lat": 35.0, "lng": -120.0},
    "type": "fishing",
    "status": "active"
}

valid_unstuck = {
    "location": "Dock B",
    "interaction_type": "manual",
    "status": "pending",
    "resolution_notes": "Test resolution"
}

valid_power_reading = {
    "power_type": "battery",
    "reading_value": 85.5,
    "sensor_type": "voltage"
}

# Test cases
@pytest.mark.parametrize("model_class,valid_data", [
    (FlightPlanCreate, valid_flight_plan),
    (EnvironmentalTestCreate, valid_environmental_test),
    (FisheryCreate, valid_fishery),
    (FishTrackingCreate, valid_fish_tracking),
    (AchievementCreate, valid_achievement),
    (StallCreate, valid_stall),
    (MovementGPSLogCreate, valid_gps_log),
    (MaintenanceScheduleCreate, valid_maintenance),
    (DestinationCreate, valid_destination),
    (UnstuckInteractionCreate, valid_unstuck),
    (PowerReadingCreate, valid_power_reading)
])
def test_valid_data(model_class, valid_data):
    """Test that valid data passes validation"""
    instance = model_class(**valid_data)
    assert instance is not None

@pytest.mark.parametrize("model_class,invalid_data,expected_error", [
    # Flight Plan tests
    (FlightPlanCreate, {"plan_name": "", "source": "DJI", "plan_data": {}}, "plan_name"),
    (FlightPlanCreate, {"plan_name": "Test", "source": "Invalid", "plan_data": {}}, "source"),
    
    # Environmental Test tests
    (EnvironmentalTestCreate, {"test_name": "", "quality_score": 85.5}, "test_name"),
    (EnvironmentalTestCreate, {"test_name": "Test", "quality_score": 101.0}, "quality_score"),
    
    # Fishery tests
    (FisheryCreate, {"name": "", "location": "Test"}, "name"),
    (FisheryCreate, {"name": "Test", "location": ""}, "location"),
    
    # Fish Tracking tests
    (FishTrackingCreate, {"fish_type": "", "tracking_data": {}, "location_lat": 35.0, "location_lng": -120.0}, "fish_type"),
    (FishTrackingCreate, {"fish_type": "Tuna", "tracking_data": {}, "location_lat": 91.0, "location_lng": -120.0}, "location_lat"),
    
    # Achievement tests
    (AchievementCreate, {"name": "", "criteria": {}}, "name"),
    (AchievementCreate, {"name": "Test", "criteria": {}, "points": -1}, "points"),
    
    # Stall tests
    (StallCreate, {"location": "", "stall_type": "Test"}, "location"),
    (StallCreate, {"location": "Test", "stall_type": "", "status": "invalid"}, "status"),
    
    # GPS Log tests
    (MovementGPSLogCreate, {"latitude": 91.0, "longitude": -120.0}, "latitude"),
    (MovementGPSLogCreate, {"latitude": 35.0, "longitude": 181.0}, "longitude"),
    
    # Maintenance Schedule tests
    (MaintenanceScheduleCreate, {"schedule_name": "", "maintenance_date": datetime.utcnow()}, "schedule_name"),
    
    # Destination tests
    (DestinationCreate, {"name": "", "location": "Test", "coordinates": {}}, "name"),
    (DestinationCreate, {"name": "Test", "location": "Test", "coordinates": {}, "status": "invalid"}, "status"),
    
    # Unstuck Interaction tests
    (UnstuckInteractionCreate, {"location": "", "interaction_type": "Test"}, "location"),
    (UnstuckInteractionCreate, {"location": "Test", "interaction_type": "", "status": "invalid"}, "status"),
    
    # Power Reading tests
    (PowerReadingCreate, {"power_type": "", "reading_value": 85.5, "sensor_type": "Test"}, "power_type"),
    (PowerReadingCreate, {"power_type": "Test", "reading_value": 85.5, "sensor_type": ""}, "sensor_type")
])
def test_invalid_data(model_class, invalid_data, expected_error):
    """Test that invalid data raises appropriate validation errors"""
    with pytest.raises(Exception) as exc_info:
        model_class(**invalid_data)
    assert expected_error in str(exc_info.value) 