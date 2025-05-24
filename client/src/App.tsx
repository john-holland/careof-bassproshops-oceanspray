import React from 'react';
import FishList from './components/FishList';
import OceanHealthList from './components/OceanHealthList';
import PressureTankList from './components/PressureTankList';
import UAVDeployment from './components/UAVDeployment';
import OceanHealthForm from './components/OceanHealthForm';

const App: React.FC = () => {
  return (
    <div>
      <h1>Fishery and UAV Dashboard</h1>
      <FishList />
      <OceanHealthList />
      <OceanHealthForm />
      <PressureTankList />
      <UAVDeployment />
    </div>
  );
};

export default App; 