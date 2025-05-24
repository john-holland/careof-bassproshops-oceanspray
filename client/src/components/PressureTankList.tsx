import React, { useEffect, useState } from 'react';
import { PressureTank, getPressureTank } from '../api/fishery';

const PressureTankList: React.FC = () => {
  const [pressureTanks, setPressureTanks] = useState<PressureTank[]>([]);

  useEffect(() => {
    const fetchPressureTanks = async () => {
      const data = await getPressureTank();
      setPressureTanks(data);
    };
    fetchPressureTanks();
  }, []);

  return (
    <div>
      <h2>Pressure Tank List</h2>
      <ul>
        {pressureTanks.map((pt) => (
          <li key={pt.id}>
            Pressure: {pt.pressure}, Volume: {pt.volume}, Last Maintenance: {pt.last_maintenance}, Operational: {pt.is_operational ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PressureTankList; 