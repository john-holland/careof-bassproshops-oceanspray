import pytest
from pact import Consumer, Provider
import sys
import os
from pathlib import Path
import requests
import subprocess
import time

# Add the project root to Python path to import the test mixin
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from test_utils.test_mixin import TestMixin

# Initialize the test mixin
test_mixin = TestMixin(__file__)

# Update test index with the command
test_mixin.index_test("cd tests/fishery-pact && python -m pytest test_fishery_pact.py -v")

# Define the consumer and provider
consumer = Consumer('fishery-consumer').has_pact_with(Provider('fishery-service'))

@pytest.fixture(scope='session', autouse=True)
def start_fishery_mock():
    """Start the fishery-mock service using docker-compose before running tests."""
    subprocess.run(['docker-compose', '-f', 'docker-compose.pact.yml', 'up', '-d', 'fishery-mock'], check=True)
    # Wait for the service to be ready
    time.sleep(2)
    yield
    # Clean up after tests
    subprocess.run(['docker-compose', '-f', 'docker-compose.pact.yml', 'down'], check=True)

@pytest.fixture(scope='session')
def pact():
    """Setup and teardown for pact tests"""
    print(f"Running {test_mixin.get_test_metadata()}")
    yield consumer
    print(f"Completed {test_mixin.get_test_metadata()}")

def test_get_fish(pact):
    """Test getting fish data"""
    expected_body = {
        'id': 1,
        'species': 'Bass',
        'weight': 2.5,
        'location': {'latitude': 0.0, 'longitude': 0.0}
    }
    # Define the expected interaction
    (pact
        .given('fish data exists')
        .upon_receiving('a request for fish data')
        .with_request('GET', '/api/fish/1')
        .will_respond_with(200, body=expected_body))

    with pact:
        url = f"{pact.uri}/api/fish/1"
        response = requests.get(url)
        assert response.status_code == 200
        assert response.json() == expected_body

def test_get_ocean_health(pact):
    """Test getting ocean health data"""
    expected_body = {
        'id': 1,
        'temperature': 22.5,
        'ph_level': 7.2,
        'oxygen_level': 8.5,
        'location': {'latitude': 0.0, 'longitude': 0.0}
    }
    # Define the expected interaction
    (pact
        .given('ocean health data exists')
        .upon_receiving('a request for ocean health data')
        .with_request('GET', '/api/ocean/health')
        .will_respond_with(200, body=expected_body))

    with pact:
        url = f"{pact.uri}/api/ocean/health"
        response = requests.get(url)
        assert response.status_code == 200
        assert response.json() == expected_body

def test_create_fish(pact):
    """Test creating fish data"""
    request_body = {
        'id': 1,
        'species': 'Bass',
        'weight': 2.5,
        'location': {'latitude': 0.0, 'longitude': 0.0}
    }
    # Define the expected interaction
    (pact
        .given('a new fish can be created')
        .upon_receiving('a request to create a fish')
        .with_request('POST', '/api/fish', body=request_body)
        .will_respond_with(201, body=request_body))

    with pact:
        url = f"{pact.uri}/api/fish"
        response = requests.post(url, json=request_body)
        assert response.status_code == 201
        assert response.json() == request_body 