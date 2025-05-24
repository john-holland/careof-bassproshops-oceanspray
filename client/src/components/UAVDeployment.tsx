import React, { useState } from 'react';
import { UAVDeployment, deployUAV } from '../api/uav';

const UAVDeploymentComponent: React.FC = () => {
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleDeploy = async () => {
    const deployment: UAVDeployment = { location };
    const result = await deployUAV(deployment);
    setStatus(result.status);
  };

  return (
    <div>
      <h2>UAV Deployment</h2>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
      />
      <button onClick={handleDeploy}>Deploy UAV</button>
      {status && <p>Status: {status}</p>}
    </div>
  );
};

export default UAVDeploymentComponent; 