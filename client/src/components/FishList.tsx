import React, { useEffect, useState } from 'react';
import { Fish, getFish } from '../api/fishery';

const FishList: React.FC = () => {
  const [fish, setFish] = useState<Fish[]>([]);

  useEffect(() => {
    const fetchFish = async () => {
      const data = await getFish();
      setFish(data);
    };
    fetchFish();
  }, []);

  return (
    <div>
      <h2>Fish List</h2>
      <ul>
        {fish.map((f) => (
          <li key={f.id}>
            {f.species} - Size: {f.size}, Weight: {f.weight}, Location: {f.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FishList; 