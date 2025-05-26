import React, { useEffect, useRef, useState } from 'react';
import { Room, Tank, ProjectionSurface, StreamConfig } from '../../server/apps/data/src/models/room.model';
import styled from 'styled-components';

interface VideoStreamViewProps {
  room: Room;
  tank?: Tank;
  streamConfigs: StreamConfig[];
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  background: #1a1a1a;
`;

const Surface = styled.div<{ type: string }>`
  position: relative;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  ${props => props.type === 'wall' && `
    transform: perspective(1000px) rotateX(0deg);
  `}
  
  ${props => props.type === 'floor' && `
    transform: perspective(1000px) rotateX(90deg);
  `}
  
  ${props => props.type === 'ceiling' && `
    transform: perspective(1000px) rotateX(-90deg);
  `}
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #4a4a4a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #5a5a5a;
  }
`;

const VideoStreamView: React.FC<VideoStreamViewProps> = ({ room, tank, streamConfigs }) => {
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [activeStreams, setActiveStreams] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Initialize video streams
    streamConfigs.forEach(config => {
      if (config.is_active && videoRefs.current[config.surface_id]) {
        const video = videoRefs.current[config.surface_id];
        if (video) {
          video.src = config.stream_url || '';
          video.play().catch(console.error);
        }
      }
    });
  }, [streamConfigs]);

  const toggleStream = (surfaceId: number) => {
    setActiveStreams(prev => ({
      ...prev,
      [surfaceId]: !prev[surfaceId]
    }));
  };

  const renderSurface = (surface: ProjectionSurface) => {
    const streamConfig = streamConfigs.find(config => config.surface_id === surface.id);
    
    return (
      <Surface key={surface.id} type={surface.type}>
        <VideoElement
          ref={el => videoRefs.current[surface.id] = el}
          autoPlay
          muted
          playsInline
        />
        <Controls>
          <Button onClick={() => toggleStream(surface.id)}>
            {activeStreams[surface.id] ? 'Stop' : 'Start'} Stream
          </Button>
          {streamConfig && (
            <Button onClick={() => window.open(streamConfig.stream_url, '_blank')}>
              Full Screen
            </Button>
          )}
        </Controls>
      </Surface>
    );
  };

  return (
    <Container>
      {room.surfaces.map(renderSurface)}
      {tank?.surfaces.map(renderSurface)}
    </Container>
  );
};

export default VideoStreamView; 