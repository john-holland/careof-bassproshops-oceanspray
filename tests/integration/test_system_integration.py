import pytest
import requests
from datetime import datetime, timedelta

def test_ocean_health_check(fishery_client, test_coordinates):
    """Test the ocean health check endpoint."""
    response = fishery_client.post(
        "http://localhost:5000/api/ocean/health",
        json=test_coordinates
    )
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "status" in data
    assert data["status"] in ["healthy", "warning", "critical"]

def test_uav_fish_survey(fishery_client, uav_client, test_coordinates):
    """Test the complete fish survey workflow."""
    # 1. Deploy UAV
    deploy_response = uav_client.post(
        "http://localhost:5001/api/uav/deploy",
        json={
            "coordinates": test_coordinates,
            "mission_type": "fish_survey"
        }
    )
    assert deploy_response.status_code == 200
    deployment_data = deploy_response.json()
    assert "deployment_id" in deployment_data

    # 2. Check UAV health
    health_response = uav_client.get("http://localhost:5001/api/uav/health")
    assert health_response.status_code == 200
    health_data = health_response.json()
    assert health_data["status"] == "healthy"

    # 3. Get fish data
    fish_data_response = uav_client.get("http://localhost:5001/api/uav/fish-data")
    assert fish_data_response.status_code == 200
    fish_data = fish_data_response.json()
    assert "fish_data" in fish_data

    # 4. Update ocean health with new data
    update_response = fishery_client.post(
        "http://localhost:5000/api/ocean/update",
        json={
            "coordinates": test_coordinates,
            "fish_data": fish_data["fish_data"]
        }
    )
    assert update_response.status_code == 200

def test_error_handling(fishery_client, uav_client):
    """Test error handling and graceful degradation."""
    # Test invalid coordinates
    invalid_coords = {"latitude": 1000, "longitude": 2000}
    response = fishery_client.post(
        "http://localhost:5000/api/ocean/health",
        json=invalid_coords
    )
    assert response.status_code == 400

    # Test UAV deployment with invalid mission type
    response = uav_client.post(
        "http://localhost:5001/api/uav/deploy",
        json={
            "coordinates": {"latitude": 35.0, "longitude": -120.0},
            "mission_type": "invalid_mission"
        }
    )
    assert response.status_code == 400

def test_historical_data(fishery_client, test_coordinates):
    """Test historical data retrieval."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    response = fishery_client.get(
        "http://localhost:5000/api/ocean/history",
        params={
            "latitude": test_coordinates["latitude"],
            "longitude": test_coordinates["longitude"],
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "metrics" in data[0]
        assert "timestamp" in data[0] 