import pytest
from pact import Consumer, Provider
from datetime import datetime, UTC
import requests
import json

# Create a Pact consumer
consumer = Consumer('uav-api').has_pact_with(Provider('fishery-service'))

# Test data
test_flight_plan = {
    "plan_name": "Test Flight",
    "source": "DJI",
    "plan_data": {"coordinates": [[0, 0], [1, 1]]}
}

test_environmental_test = {
    "test_name": "Water Quality Test",
    "quality_score": 85.5,
    "notes": "Test notes"
}

test_fishery = {
    "name": "Test Fishery",
    "location": "Test Location",
    "contact_info": {"phone": "123-456-7890"},
    "operating_hours": {"weekday": "9-5"}
}

test_fish_tracking = {
    "fish_type": "Tuna",
    "tracking_data": {"depth": 50},
    "location_lat": 35.0,
    "location_lng": -120.0,
    "metadata": {"temperature": 18.5}
}

@pytest.fixture(scope='session')
def pact():
    """Setup and teardown for pact tests"""
    consumer.start_service()
    yield consumer
    try:
        consumer.stop_service()
    except RuntimeError:
        pass  # Ignore errors during cleanup

def test_flight_plan_creation(pact):
    """Test flight plan creation contract"""
    expected_response = {
        "id": 1,
        "plan_name": "Test Flight",
        "source": "DJI",
        "plan_data": {"coordinates": [[0, 0], [1, 1]]},
        "created_at": datetime.now(UTC).isoformat()
    }

    (pact
     .given('a valid flight plan')
     .upon_receiving('a request to create a flight plan')
     .with_request('POST', '/flight-plans/', body=test_flight_plan)
     .will_respond_with(200, body=expected_response))

    with pact:
        # Make the actual request to your API
        response = requests.post(f"{pact.uri}/flight-plans/", json=test_flight_plan)
        assert response.status_code == 200
        assert response.json()['plan_name'] == test_flight_plan['plan_name']

def test_environmental_test_creation(pact):
    """Test environmental test creation contract"""
    expected_response = {
        "id": 1,
        "test_name": "Water Quality Test",
        "quality_score": 85.5,
        "notes": "Test notes",
        "test_date": datetime.now(UTC).isoformat()
    }

    (pact
     .given('a valid environmental test')
     .upon_receiving('a request to create an environmental test')
     .with_request('POST', '/environmental-tests/', body=test_environmental_test)
     .will_respond_with(200, body=expected_response))

    with pact:
        response = requests.post(f"{pact.uri}/environmental-tests/", json=test_environmental_test)
        assert response.status_code == 200
        assert response.json()['test_name'] == test_environmental_test['test_name']

def test_fishery_creation(pact):
    """Test fishery creation contract"""
    expected_response = {
        "id": 1,
        "name": "Test Fishery",
        "location": "Test Location",
        "contact_info": {"phone": "123-456-7890"},
        "operating_hours": {"weekday": "9-5"},
        "created_at": datetime.now(UTC).isoformat(),
        "updated_at": datetime.now(UTC).isoformat()
    }

    (pact
     .given('a valid fishery')
     .upon_receiving('a request to create a fishery')
     .with_request('POST', '/fisheries/', body=test_fishery)
     .will_respond_with(200, body=expected_response))

    with pact:
        response = requests.post(f"{pact.uri}/fisheries/", json=test_fishery)
        assert response.status_code == 200
        assert response.json()['name'] == test_fishery['name']

def test_fish_tracking_creation(pact):
    """Test fish tracking creation contract"""
    expected_response = {
        "id": 1,
        "fish_type": "Tuna",
        "tracking_data": {"depth": 50},
        "location_lat": 35.0,
        "location_lng": -120.0,
        "metadata": {"temperature": 18.5},
        "timestamp": datetime.now(UTC).isoformat()
    }

    (pact
     .given('a valid fish tracking entry')
     .upon_receiving('a request to create a fish tracking entry')
     .with_request('POST', '/fish-tracking/', body=test_fish_tracking)
     .will_respond_with(200, body=expected_response))

    with pact:
        response = requests.post(f"{pact.uri}/fish-tracking/", json=test_fish_tracking)
        assert response.status_code == 200
        assert response.json()['fish_type'] == test_fish_tracking['fish_type']

def test_get_flight_plans(pact):
    """Test getting flight plans contract"""
    expected_response = [{
        "id": 1,
        "plan_name": "Test Flight",
        "source": "DJI",
        "plan_data": {"coordinates": [[0, 0], [1, 1]]},
        "created_at": datetime.now(UTC).isoformat()
    }]

    (pact
     .given('flight plans exist')
     .upon_receiving('a request to get flight plans')
     .with_request('GET', '/flight-plans/')
     .will_respond_with(200, body=expected_response))

    with pact:
        response = requests.get(f"{pact.uri}/flight-plans/")
        assert response.status_code == 200
        assert len(response.json()) > 0

def test_get_fisheries(pact):
    """Test getting fisheries contract"""
    expected_response = [{
        "id": 1,
        "name": "Test Fishery",
        "location": "Test Location",
        "contact_info": {"phone": "123-456-7890"},
        "operating_hours": {"weekday": "9-5"},
        "created_at": datetime.now(UTC).isoformat(),
        "updated_at": datetime.now(UTC).isoformat()
    }]

    (pact
     .given('fisheries exist')
     .upon_receiving('a request to get fisheries')
     .with_request('GET', '/fisheries/')
     .will_respond_with(200, body=expected_response))

    with pact:
        response = requests.get(f"{pact.uri}/fisheries/")
        assert response.status_code == 200
        assert len(response.json()) > 0 