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
test_mixin.index_test("cd tests/uav-pact && python -m pytest test_uav_pact.py -v")

# Define the consumer and provider
consumer = Consumer('uav-consumer').has_pact_with(Provider('uav-service'))

@pytest.fixture(scope='session', autouse=True)
def start_uav_mock():
    """Start the uav-mock service using docker-compose before running tests."""
    subprocess.run(['docker-compose', '-f', 'docker-compose.pact.yml', 'up', '-d', 'uav-mock'], check=True)
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

def test_get_uav_deployment(pact):
    """Test getting UAV deployment data"""
    expected_body = {
        'id': 1,
        'status': 'active',
        'location': {'latitude': 0.0, 'longitude': 0.0},
        'battery_level': 85.5
    }
    # Define the expected interaction
    (pact
        .given('a UAV deployment exists')
        .upon_receiving('a request for UAV deployment')
        .with_request('GET', '/api/uav/deployment/1')
        .will_respond_with(200, body=expected_body))

    with pact:
        url = f"{pact.uri}/api/uav/deployment/1"
        response = requests.get(url)
        assert response.status_code == 200
        assert response.json() == expected_body

def test_get_uav_status(pact):
    """Test getting UAV status data"""
    expected_body = {
        'id': 1,
        'status': 'flying',
        'altitude': 100.0,
        'speed': 15.0,
        'battery_level': 75.0
    }
    # Define the expected interaction
    (pact
        .given('UAV status data exists')
        .upon_receiving('a request for UAV status')
        .with_request('GET', '/api/uav/status/1')
        .will_respond_with(200, body=expected_body))

    with pact:
        url = f"{pact.uri}/api/uav/status/1"
        response = requests.get(url)
        assert response.status_code == 200
        assert response.json() == expected_body

def test_create_uav_deployment(pact):
    """Test creating UAV deployment data"""
    request_body = {
        'id': 1,
        'status': 'active',
        'location': {'latitude': 0.0, 'longitude': 0.0},
        'battery_level': 85.5
    }
    # Define the expected interaction
    (pact
        .given('a new UAV deployment can be created')
        .upon_receiving('a request to create a UAV deployment')
        .with_request('POST', '/api/uav/deployment', body=request_body)
        .will_respond_with(201, body=request_body))

    with pact:
        url = f"{pact.uri}/api/uav/deployment"
        response = requests.post(url, json=request_body)
        assert response.status_code == 201
        assert response.json() == request_body 