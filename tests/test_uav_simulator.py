import pytest
from datetime import datetime, timedelta
from uav_simulator import UAVSimulator, GPSPoint, Fish, WaterQuality

def test_uav_initialization():
    uav = UAVSimulator()
    assert uav.status.battery_level == 1.0
    assert uav.status.is_operational == True
    assert len(uav.fish_population) == 50

def test_gps_fence():
    uav = UAVSimulator()
    # Test within bounds
    assert uav.fence.is_within_bounds(GPSPoint(0.0, 0.0, 0.0)) == True
    # Test outside bounds
    assert uav.fence.is_within_bounds(GPSPoint(1.0, 1.0, 0.0)) == False

def test_fish_finder():
    uav = UAVSimulator()
    # Move UAV to a known position
    uav.status.position = GPSPoint(0.0, 0.0, 0.0)
    # Place a fish within detection range
    fish = Fish(
        id="test_fish",
        position=GPSPoint(0.0001, 0.0001, -2.0),
        species="Test",
        size=0.5,
        last_seen=datetime.now()
    )
    uav.fish_population = [fish]
    
    detected = uav.get_detected_fish()
    assert len(detected) == 1
    assert detected[0].id == "test_fish"

def test_battery_drain():
    uav = UAVSimulator()
    initial_battery = uav.status.battery_level
    uav.update_status()
    assert uav.status.battery_level < initial_battery

def test_water_quality_changes():
    uav = UAVSimulator()
    initial_temp = uav.status.water_quality.temperature
    initial_ph = uav.status.water_quality.ph
    initial_oxygen = uav.status.water_quality.oxygen
    
    uav.update_status()
    
    assert uav.status.water_quality.temperature != initial_temp
    assert uav.status.water_quality.ph != initial_ph
    assert uav.status.water_quality.oxygen != initial_oxygen

def test_fish_movement():
    uav = UAVSimulator()
    initial_positions = [
        (fish.position.lat, fish.position.lon, fish.position.alt)
        for fish in uav.fish_population
    ]
    
    uav.update_status()
    
    for i, fish in enumerate(uav.fish_population):
        assert (fish.position.lat, fish.position.lon, fish.position.alt) != initial_positions[i]

def test_maintenance():
    uav = UAVSimulator()
    # Drain battery
    uav.status.battery_level = 0.2
    uav.status.is_operational = False
    
    # Perform maintenance
    uav.status.last_maintenance = datetime.now()
    uav.status.battery_level = 1.0
    uav.status.is_operational = True
    
    assert uav.status.battery_level == 1.0
    assert uav.status.is_operational == True

def test_fish_finder_scan_interval():
    uav = UAVSimulator()
    # First scan
    first_scan = uav.get_detected_fish()
    # Immediate second scan should return empty
    second_scan = uav.get_detected_fish()
    assert len(second_scan) == 0

def test_fish_population_diversity():
    uav = UAVSimulator()
    species = set(fish.species for fish in uav.fish_population)
    assert len(species) > 1  # Should have multiple species

def test_water_quality_bounds():
    uav = UAVSimulator()
    for _ in range(100):  # Run multiple updates
        uav.update_status()
        assert 0 <= uav.status.water_quality.ph <= 14
        assert uav.status.water_quality.temperature > 0
        assert uav.status.water_quality.oxygen > 0 