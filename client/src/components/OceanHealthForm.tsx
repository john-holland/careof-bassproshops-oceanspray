import React, { useState } from 'react';
import { OceanHealth, createOceanHealth } from '../api/ocean_health';

const OceanHealthForm: React.FC = () => {
  const [oceanHealth, setOceanHealth] = useState<Omit<OceanHealth, 'id'>>({
    temperature: 0,
    salinity: 0,
    ph_level: 0,
    pollution_level: 0,
    location: '',
    recorded_at: new Date().toISOString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createOceanHealth(oceanHealth);
    console.log('Created ocean health:', result);
    setOceanHealth({
      temperature: 0,
      salinity: 0,
      ph_level: 0,
      pollution_level: 0,
      location: '',
      recorded_at: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Ocean Health Data</h2>
      <input
        type="number"
        value={oceanHealth.temperature}
        onChange={(e) => setOceanHealth({ ...oceanHealth, temperature: parseFloat(e.target.value) })}
        placeholder="Temperature"
      />
      <input
        type="number"
        value={oceanHealth.salinity}
        onChange={(e) => setOceanHealth({ ...oceanHealth, salinity: parseFloat(e.target.value) })}
        placeholder="Salinity"
      />
      <input
        type="number"
        value={oceanHealth.ph_level}
        onChange={(e) => setOceanHealth({ ...oceanHealth, ph_level: parseFloat(e.target.value) })}
        placeholder="pH Level"
      />
      <input
        type="number"
        value={oceanHealth.pollution_level}
        onChange={(e) => setOceanHealth({ ...oceanHealth, pollution_level: parseFloat(e.target.value) })}
        placeholder="Pollution Level"
      />
      <input
        type="text"
        value={oceanHealth.location}
        onChange={(e) => setOceanHealth({ ...oceanHealth, location: e.target.value })}
        placeholder="Location"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default OceanHealthForm; 