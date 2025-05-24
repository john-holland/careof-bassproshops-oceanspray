#!/usr/bin/env python3

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import qrcode
from io import BytesIO
import json
from datetime import datetime
import os
from simulation.robotic_monitor import RoboticMonitor
from simulation.fish_behavior import FishBehavior
from simulation.environment import Environment
from simulation.pressure_tank import PressureTank

app = Flask(__name__)
CORS(app)

# Initialize simulation components
robotic_monitor = RoboticMonitor(num_robots=3)
fish_behavior = FishBehavior()
environment = Environment()
pressure_tank = PressureTank()

@app.route('/api/simulation/status', methods=['GET'])
def get_simulation_status():
    """Get current simulation status."""
    return jsonify({
        'robots': [
            {
                'id': id(robot),
                'position': robot.position.tolist(),
                'battery_level': robot.battery_level,
                'sensors_active': robot.sensors_active,
                'current_mission': robot.current_mission
            }
            for robot in robotic_monitor.robots
        ],
        'fish_data': robotic_monitor.fish_tracking_data,
        'environment': environment.get_statistics(),
        'pressure': pressure_tank.get_statistics(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/qr/generate', methods=['POST'])
def generate_qr():
    """Generate QR code for mobile interaction."""
    data = request.json
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Create QR code with simulation access token
    qr_data = {
        'simulation_id': id(robotic_monitor),
        'access_token': os.urandom(16).hex(),
        'timestamp': datetime.now().isoformat()
    }
    qr.add_data(json.dumps(qr_data))
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

@app.route('/api/mobile/connect', methods=['POST'])
def mobile_connect():
    """Handle mobile device connection."""
    data = request.json
    # Validate QR code data
    if not all(k in data for k in ['simulation_id', 'access_token']):
        return jsonify({'error': 'Invalid QR code data'}), 400
    
    # Here you would typically validate the access token
    # and establish a WebSocket connection for real-time updates
    
    return jsonify({
        'status': 'connected',
        'simulation_id': data['simulation_id'],
        'connection_id': os.urandom(8).hex()
    })

@app.route('/api/mobile/control', methods=['POST'])
def mobile_control():
    """Handle mobile control commands."""
    data = request.json
    command = data.get('command')
    robot_id = data.get('robot_id')
    
    if not command or not robot_id:
        return jsonify({'error': 'Missing command or robot_id'}), 400
    
    # Find the robot
    robot = next((r for r in robotic_monitor.robots if id(r) == robot_id), None)
    if not robot:
        return jsonify({'error': 'Robot not found'}), 404
    
    # Handle different commands
    if command == 'return_to_charging':
        robot.current_mission = 'charging'
    elif command == 'patrol':
        robot.current_mission = 'patrol'
    elif command == 'track_fish':
        robot.current_mission = 'track_fish'
    
    return jsonify({
        'status': 'success',
        'robot_id': robot_id,
        'new_mission': robot.current_mission
    })

@app.route('/api/tank/reading', methods=['POST'])
def get_tank_reading():
    """Get tank readings from QR code data."""
    data = request.json
    qr_data = data.get('qr_data', {})
    
    # Extract tank ID from QR data
    tank_id = qr_data.get('tank_id')
    if not tank_id:
        return jsonify({'error': 'Invalid tank ID'}), 400
    
    # Get tank readings from simulation
    tank_readings = {
        'tank_id': tank_id,
        'pressure': pressure_tank.get_pressure(),
        'temperature': environment.get_temperature(),
        'water_quality': {
            'ph': environment.get_ph(),
            'oxygen': environment.get_oxygen_level(),
            'salinity': environment.get_salinity()
        },
        'fish_count': len(robotic_monitor.fish_tracking_data),
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(tank_readings)

if __name__ == '__main__':
    app.run(debug=True, port=5000) 