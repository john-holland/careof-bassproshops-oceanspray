import pytest
from pact import Consumer, Provider
import requests
import os

# Define the consumer and provider
consumer = Consumer('fishery-consumer').has_pact_with(Provider('fishery-service'))

# Test data
test_fish = {
    "id": 1,
    "species": "Bass",
    "weight": 2.5,
    "location": {"latitude": 0.0, "longitude": 0.0}
}

test_ocean_health = {
    "id": 1,
    "temperature": 22.5,
    "ph_level": 7.2,
    "oxygen_level": 8.5,
    "location": {"latitude": 0.0, "longitude": 0.0}
}

@pytest.fixture(scope='session')
def pact():
    yield consumer

def test_get_fish(pact):
    # Define the expected interaction
    (pact
        .given('a fish exists')
        .upon_receiving('a request for fish')
        .with_request('GET', '/api/fish/1')
        .will_respond_with(200, body=test_fish))

    # Make the actual request to the mock service
    with pact:
        response = requests.get(f"{pact.uri}/api/fish/1")
        assert response.status_code == 200
        assert response.json() == test_fish

def test_get_ocean_health(pact):
    # Define the expected interaction
    (pact
        .given('ocean health data exists')
        .upon_receiving('a request for ocean health')
        .with_request('GET', '/api/ocean/health')
        .will_respond_with(200, body=test_ocean_health))

    # Make the actual request to the mock service
    with pact:
        response = requests.get(f"{pact.uri}/api/ocean/health")
        assert response.status_code == 200
        assert response.json() == test_ocean_health

def test_create_fish(pact):
    # Define the expected interaction
    (pact
        .given('a new fish can be created')
        .upon_receiving('a request to create a fish')
        .with_request('POST', '/api/fish', body=test_fish)
        .will_respond_with(201, body=test_fish))

    # Make the actual request to the mock service
    with pact:
        response = requests.post(f"{pact.uri}/api/fish", json=test_fish)
        assert response.status_code == 201
        assert response.json() == test_fish 