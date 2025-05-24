import pytest
from pact import Consumer, Provider
import requests
from datetime import datetime, timedelta

pact = Consumer('fishery').has_pact_with(Provider('uav'), host_name='localhost', port=5001)

def test_uav_data_retrieval():
    # Define the expected interaction
    (pact
        .given('UAV has fish population data')
        .upon_receiving('a request for fish population data')
        .with_request('GET', '/api/uav/fish-data')
        .will_respond_with(200, body={
            'timestamp': '2024-03-20T12:00:00Z',
            'fish_data': {
                'species': 'tuna',
                'count': 150,
                'location': {
                    'latitude': 35.0,
                    'longitude': -120.0
                },
                'depth': 50.0,
                'temperature': 18.5
            }
        }))

    with pact:
        # Make the actual request
        response = requests.get('http://localhost:5001/api/uav/fish-data')
        assert response.status_code == 200
        data = response.json()
        assert 'fish_data' in data
        assert data['fish_data']['species'] == 'tuna'

def test_uav_health_status():
    (pact
        .given('UAV is operational')
        .upon_receiving('a request for UAV health status')
        .with_request('GET', '/api/uav/health')
        .will_respond_with(200, body={
            'status': 'healthy',
            'battery_level': 0.85,
            'signal_strength': 'strong',
            'last_maintenance': '2024-03-19T00:00:00Z'
        }))

    with pact:
        response = requests.get('http://localhost:5001/api/uav/health')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['battery_level'] > 0

def test_uav_deployment():
    (pact
        .given('UAV is available for deployment')
        .upon_receiving('a request to deploy UAV')
        .with_request('POST', '/api/uav/deploy')
        .with_body({
            'coordinates': {
                'latitude': 35.0,
                'longitude': -120.0
            },
            'mission_type': 'fish_survey'
        })
        .will_respond_with(200, body={
            'deployment_id': 'uav-123',
            'status': 'deployed',
            'estimated_completion': '2024-03-20T13:00:00Z'
        }))

    with pact:
        response = requests.post('http://localhost:5001/api/uav/deploy', json={
            'coordinates': {
                'latitude': 35.0,
                'longitude': -120.0
            },
            'mission_type': 'fish_survey'
        })
        assert response.status_code == 200
        data = response.json()
        assert 'deployment_id' in data
        assert data['status'] == 'deployed' 