import pytest
import requests
from typing import Generator
import time
import os

@pytest.fixture(scope="session")
def wait_for_services():
    """Wait for all services to be ready before running tests."""
    services = [
        ("fishery", "http://localhost:5000/health"),
        ("uav", "http://localhost:5001/health"),
        ("client", "http://localhost:3000")
    ]
    
    for service_name, url in services:
        max_retries = 30
        retry_interval = 2
        
        for i in range(max_retries):
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    print(f"{service_name} service is ready")
                    break
            except requests.exceptions.ConnectionError:
                if i == max_retries - 1:
                    raise Exception(f"{service_name} service failed to start")
                print(f"Waiting for {service_name} service...")
                time.sleep(retry_interval)

@pytest.fixture(scope="session")
def fishery_client():
    """Create a client for the fishery service."""
    return requests.Session()

@pytest.fixture(scope="session")
def uav_client():
    """Create a client for the UAV service."""
    return requests.Session()

@pytest.fixture(scope="session")
def test_coordinates():
    """Provide test coordinates for ocean health checks."""
    return {
        "latitude": 35.0,
        "longitude": -120.0
    } 