CREATE TABLE IF NOT EXISTS water_quality (
    id SERIAL PRIMARY KEY,
    temperature FLOAT NOT NULL,
    salinity FLOAT NOT NULL,
    ph_level FLOAT NOT NULL,
    pollution_level FLOAT NOT NULL,
    location VARCHAR(255) NOT NULL,
    recorded_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS fish_populations (
    id SERIAL PRIMARY KEY,
    species VARCHAR(255) NOT NULL,
    population_count INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    recorded_at TIMESTAMP NOT NULL
); 