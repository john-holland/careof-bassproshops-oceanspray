import pytest
from pact import Consumer, Provider
import requests
import os

# Define the consumer and provider
consumer = Consumer('uav-consumer').has_pact_with(Provider('uav-service'))

# Test data
test_uav_deployment = {
    "id": 1,
    "status": "active",
    "location": {"latitude": 0.0, "longitude": 0.0},
    "battery_level": 85.5
}

test_uav_status = {
    "id": 1,
    "status": "flying",
    "altitude": 100.0,
    "speed": 15.0,
    "battery_level": 75.0
}

@pytest.fixture(scope='session')
def pact():
    yield consumer

def test_get_uav_deployment(pact):
    # Define the expected interaction
    (pact
        .given('a UAV deployment exists')
        .upon_receiving('a request for UAV deployment')
        .with_request('GET', '/api/uav/deployment/1')
        .will_respond_with(200, body=test_uav_deployment))

    # Make the actual request to the mock service
    with pact:
        response = requests.get(f"{pact.uri}/api/uav/deployment/1")
        assert response.status_code == 200
        assert response.json() == test_uav_deployment

def test_get_uav_status(pact):
    # Define the expected interaction
    (pact
        .given('UAV status data exists')
        .upon_receiving('a request for UAV status')
        .with_request('GET', '/api/uav/status/1')
        .will_respond_with(200, body=test_uav_status))

    # Make the actual request to the mock service
    with pact:
        response = requests.get(f"{pact.uri}/api/uav/status/1")
        assert response.status_code == 200
        assert response.json() == test_uav_status

def test_create_uav_deployment(pact):
    # Define the expected interaction
    (pact
        .given('a new UAV deployment can be created')
        .upon_receiving('a request to create a UAV deployment')
        .with_request('POST', '/api/uav/deployment', body=test_uav_deployment)
        .will_respond_with(201, body=test_uav_deployment))

    # Make the actual request to the mock service
    with pact:
        response = requests.post(f"{pact.uri}/api/uav/deployment", json=test_uav_deployment)
        assert response.status_code == 201
        assert response.json() == test_uav_deployment 