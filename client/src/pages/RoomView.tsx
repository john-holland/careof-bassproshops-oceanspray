import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FisheryMonitor from '../components/FisheryMonitor';
import { Room, Tank } from '../../server/apps/data/src/models/room.model';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
`;

const Header = styled.header`
  padding: 1rem;
  background: #2a2a2a;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const RoomView: React.FC = () => {
  const { roomId, tankId } = useParams<{ roomId: string; tankId?: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [tank, setTank] = useState<Tank | null>(null);

  useEffect(() => {
    // Fetch room data
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error('Failed to fetch room data:', error);
      }
    };

    // Fetch tank data if tankId is provided
    const fetchTankData = async () => {
      if (tankId) {
        try {
          const response = await fetch(`/api/tanks/${tankId}`);
          const data = await response.json();
          setTank(data);
        } catch (error) {
          console.error('Failed to fetch tank data:', error);
        }
      }
    };

    fetchRoomData();
    fetchTankData();
  }, [roomId, tankId]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>
          {room.name}
          {tank && ` - ${tank.name}`}
        </Title>
      </Header>
      <FisheryMonitor room={room} tank={tank || undefined} />
    </PageContainer>
  );
};

export default RoomView; 