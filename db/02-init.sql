-- Create databases (will not error if they already exist)
CREATE DATABASE uav;
CREATE DATABASE fishery;
CREATE DATABASE pact_broker;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE uav TO postgres;
GRANT ALL PRIVILEGES ON DATABASE fishery TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pact_broker TO postgres;

-- Create UAV database schema
-- Connect to the UAV database
\c uav;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables for UAV data

-- Flight Plans (DJI and SwellPro)
CREATE TABLE flight_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'DJI' or 'SwellPro'
    plan_data JSONB NOT NULL, -- Includes KML, SHP, and GeoTIFF formats
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Environmental Testing Quality
CREATE TABLE environmental_tests (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    quality_score FLOAT NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Fishery Association
CREATE TABLE fisheries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_info JSONB,
    operating_hours JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fish Tracking
CREATE TABLE fish_tracking (
    id SERIAL PRIMARY KEY,
    fish_type VARCHAR(100) NOT NULL,
    tracking_data JSONB NOT NULL,
    location_lat FLOAT NOT NULL,
    location_lng FLOAT NOT NULL,
    fish_id INTEGER REFERENCES fish(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Fish table
CREATE TABLE fish (
    id SERIAL PRIMARY KEY,
    species VARCHAR(100) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    points INTEGER DEFAULT 0,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);

-- Stalls
CREATE TABLE stalls (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    stall_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movement GPS Logs
CREATE TABLE movement_gps_logs (
    id SERIAL PRIMARY KEY,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Maintenance Schedules
CREATE TABLE maintenance_schedules (
    id SERIAL PRIMARY KEY,
    schedule_name VARCHAR(255) NOT NULL,
    maintenance_date TIMESTAMP NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unstuck Interactions
CREATE TABLE unstuck_interactions (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Power / Solar Panel Readings
CREATE TABLE power_readings (
    id SERIAL PRIMARY KEY,
    power_type VARCHAR(100) NOT NULL,
    reading_value FLOAT NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connect to the Fishery database
\c fishery;

-- Create Fishery database schema
CREATE TABLE ocean_health (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    health_score FLOAT NOT NULL,
    measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB NOT NULL,
    notes TEXT
);

-- Create Pact Broker database schema
\c pact_broker;

CREATE TABLE pacts (
    id SERIAL PRIMARY KEY,
    consumer VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    pact_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 