import pytest
from pact import Provider
from fastapi.testclient import TestClient
from uav.src.main import app

pact = Provider('uav')

@pytest.fixture
def client():
    return TestClient(app)

def test_provider_fish_data(client):
    pact.verify_with_client(client, 'fishery', 'uav')

def test_provider_health_status(client):
    pact.verify_with_client(client, 'fishery', 'uav')

def test_provider_deployment(client):
    pact.verify_with_client(client, 'fishery', 'uav') 