import React, { useEffect, useState } from 'react';
import { fetchFish, fetchOceanHealth, fetchUAVStatus, Fish, OceanHealth, UAVStatus } from './api';
import QRRouter from './components/QRRouter';

interface Tank {
  id: number;
  name: string;
  type: 'stock' | 'food';
  foodSchedule: string;
  preyPopulation: number;
  filterTimer: number;
  verifiedPopulation: number;
}

interface Fishery {
  id: number;
  name: string;
  location: string;
  tanks: Tank[];
}

const App: React.FC = () => {
  const [fish, setFish] = useState<Fish[]>([]);
  const [oceanHealth, setOceanHealth] = useState<OceanHealth[]>([]);
  const [uavStatus, setUAVStatus] = useState<UAVStatus[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([
    { id: 1, name: 'Tank 1', type: 'stock', foodSchedule: 'Every 6 hours', preyPopulation: 100, filterTimer: 24, verifiedPopulation: 0 },
    { id: 2, name: 'Tank 2', type: 'food', foodSchedule: 'Every 4 hours', preyPopulation: 200, filterTimer: 12, verifiedPopulation: 0 },
  ]);
  const [fisheries, setFisheries] = useState<Fishery[]>([
    { id: 1, name: 'Fishery 1', location: 'Pacific', tanks: [tanks[0]] },
    { id: 2, name: 'Fishery 2', location: 'Atlantic', tanks: [tanks[1]] },
  ]);

  useEffect(() => {
    const loadData = async () => {
      const fishData = await fetchFish();
      const oceanHealthData = await fetchOceanHealth();
      const uavStatusData = await fetchUAVStatus();
      setFish(fishData);
      setOceanHealth(oceanHealthData);
      setUAVStatus(uavStatusData);
    };
    loadData();
  }, []);

  const openPokemonGo = () => {
    window.open('https://pokemongo.com', '_blank');
  };

  const resetFilterTimer = (tankId: number) => {
    setTanks(tanks.map(tank => tank.id === tankId ? { ...tank, filterTimer: 24 } : tank));
  };

  const verifyTankPopulation = (tankId: number) => {
    // Simulate fish finder verification
    const verifiedCount = Math.floor(Math.random() * 50) + 50; // Random count between 50 and 100
    setTanks(tanks.map(tank => tank.id === tankId ? { ...tank, verifiedPopulation: verifiedCount } : tank));
  };

  return (
    <div>
      <h1>Fishery and UAV Dashboard</h1>
      <button onClick={openPokemonGo}>Open Pokemon Go</button>
      <h2>Fish</h2>
      <ul>
        {fish.map((f) => (
          <li key={f.id}>{f.species} - {f.size}cm, {f.weight}kg</li>
        ))}
      </ul>
      <h2>Ocean Health</h2>
      <ul>
        {oceanHealth.map((h) => (
          <li key={h.id}>Temperature: {h.temperature}°C, Salinity: {h.salinity}, pH: {h.ph_level}</li>
        ))}
      </ul>
      <h2>UAV Status</h2>
      <ul>
        {uavStatus.map((u) => (
          <li key={u.id}>Status: {u.status}, Battery: {u.battery_level}%</li>
        ))}
      </ul>
      <h2>Fisheries</h2>
      <ul>
        {fisheries.map((fishery) => (
          <li key={fishery.id}>
            <h3>{fishery.name}</h3>
            <p>Location: {fishery.location}</p>
            <h4>Tanks</h4>
            <ul>
              {fishery.tanks.map((tank) => (
                <li key={tank.id}>
                  <h5>{tank.name}</h5>
                  <p>Type: {tank.type}</p>
                  <p>Food Schedule: {tank.foodSchedule}</p>
                  <p>Prey Population: {tank.preyPopulation}</p>
                  <p>Filter Timer: {tank.filterTimer} hours</p>
                  <button onClick={() => resetFilterTimer(tank.id)}>Reset Filter Timer</button>
                  <button onClick={() => verifyTankPopulation(tank.id)}>Verify Population</button>
                  <p>Verified Population: {tank.verifiedPopulation}</p>
                  <QRRouter tankId={tank.id} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App; 