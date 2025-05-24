import React, { useEffect, useState } from 'react';
import { OceanHealth, getOceanHealth } from '../api/fishery';

const OceanHealthList: React.FC = () => {
  const [oceanHealth, setOceanHealth] = useState<OceanHealth[]>([]);

  useEffect(() => {
    const fetchOceanHealth = async () => {
      const data = await getOceanHealth();
      setOceanHealth(data);
    };
    fetchOceanHealth();
  }, []);

  return (
    <div>
      <h2>Ocean Health List</h2>
      <ul>
        {oceanHealth.map((oh) => (
          <li key={oh.id}>
            Temperature: {oh.temperature}, Salinity: {oh.salinity}, pH: {oh.ph_level}, Pollution: {oh.pollution_level}, Location: {oh.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OceanHealthList; 