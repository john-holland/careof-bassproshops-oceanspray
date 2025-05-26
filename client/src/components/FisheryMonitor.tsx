import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { VideoStream, VideoRecording } from '../../server/apps/data/src/models/video.model';
import { Room, Tank, FishBehavior, FishDetection } from '../../server/apps/data/src/models/room.model';

interface FisheryMonitorProps {
  room: Room;
  tank?: Tank;
}

const MonitorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  background: #1a1a1a;
`;

const VideoWindow = styled.div<{ isFullscreen: boolean }>`
  position: relative;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  ${props => props.isFullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    border-radius: 0;
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

const QualitySelector = styled.select`
  padding: 0.5rem;
  background: #4a4a4a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const StatusBar = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
`;

const BehaviorOverlay = styled.div`
  position: absolute;
  top: 4rem;
  left: 1rem;
  right: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CurrentControl = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: #4a4a4a;
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const DirectionControl = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const DirectionButton = styled.button<{ active: boolean }>`
  padding: 0.5rem;
  background: ${props => props.active ? '#5a5a5a' : '#4a4a4a'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #5a5a5a;
  }
`;

const FisheryMonitor: React.FC<FisheryMonitorProps> = ({ room, tank }) => {
  const [streams, setStreams] = useState<VideoStream[]>([]);
  const [recordings, setRecordings] = useState<VideoRecording[]>([]);
  const [fullscreenWindow, setFullscreenWindow] = useState<number | null>(null);
  const [streamQualities, setStreamQualities] = useState<{ [key: number]: string }>({});
  const [behaviors, setBehaviors] = useState<{ [key: number]: FishBehavior }>({});
  const [currentStrength, setCurrentStrength] = useState(0);
  const [currentDirection, setCurrentDirection] = useState({ x: 0, y: 0, z: 0 });
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Fetch active streams
    const fetchStreams = async () => {
      try {
        const response = await fetch(`/api/streams?roomId=${room.id}${tank ? `&tankId=${tank.id}` : ''}`);
        const data = await response.json();
        setStreams(data);
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      }
    };

    fetchStreams();
  }, [room.id, tank?.id]);

  // Process video frames for fish detection
  useEffect(() => {
    const processFrames = async () => {
      if (!tank) return;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const processStream = async (stream: VideoStream) => {
        const video = videoRefs.current[stream.id];
        if (!video || !context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const frame = canvas.toDataURL('image/jpeg').split(',')[1];

        try {
          const response = await fetch(`/api/tanks/${tank.id}/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame })
          });
          const { behavior } = await response.json();
          setBehaviors(prev => ({ ...prev, [stream.id]: behavior }));
        } catch (error) {
          console.error('Failed to process frame:', error);
        }
      };

      // Process each stream every 500ms
      const interval = setInterval(() => {
        streams.forEach(processStream);
      }, 500);

      return () => clearInterval(interval);
    };

    processFrames();
  }, [tank, streams]);

  const applyCurrent = async () => {
    if (!tank) return;

    try {
      await fetch(`/api/tanks/${tank.id}/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strength: currentStrength,
          direction: currentDirection,
          duration: 5000 // 5 seconds
        })
      });
    } catch (error) {
      console.error('Failed to apply current:', error);
    }
  };

  const toggleFullscreen = (streamId: number) => {
    setFullscreenWindow(fullscreenWindow === streamId ? null : streamId);
  };

  const updateStreamQuality = async (streamId: number, quality: string) => {
    try {
      await fetch(`/api/streams/${streamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality })
      });
      setStreamQualities(prev => ({ ...prev, [streamId]: quality }));
    } catch (error) {
      console.error('Failed to update stream quality:', error);
    }
  };

  const startRecording = async (streamId: number) => {
    try {
      const response = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uav_id: streams.find(s => s.id === streamId)?.uav_id,
          duration: 3600, // 1 hour
          quality: streamQualities[streamId] || 'high'
        })
      });
      const data = await response.json();
      setRecordings(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async (recordingId: number) => {
    try {
      await fetch(`/api/recordings/${recordingId}/stop`, {
        method: 'POST'
      });
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  return (
    <MonitorContainer>
      {streams.map(stream => (
        <VideoWindow key={stream.id} isFullscreen={fullscreenWindow === stream.id}>
          <VideoElement
            ref={el => videoRefs.current[stream.id] = el}
            src={stream.stream_url}
            autoPlay
            muted
            playsInline
          />
          {behaviors[stream.id] && (
            <BehaviorOverlay>
              <div>Fish Count: {behaviors[stream.id].fish_count}</div>
              <div>Activity Level: {behaviors[stream.id].activity_level}</div>
              <div>Stress Level: {behaviors[stream.id].stress_level}</div>
              <div>Average Speed: {behaviors[stream.id].average_speed.toFixed(2)} m/s</div>
            </BehaviorOverlay>
          )}
          {tank && (
            <CurrentControl>
              <div>Current Control</div>
              <Slider
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={currentStrength}
                onChange={(e) => setCurrentStrength(parseFloat(e.target.value))}
              />
              <DirectionControl>
                <DirectionButton
                  active={currentDirection.x === -1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, x: -1 }))}
                >
                  ←
                </DirectionButton>
                <DirectionButton
                  active={currentDirection.y === -1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, y: -1 }))}
                >
                  ↑
                </DirectionButton>
                <DirectionButton
                  active={currentDirection.z === -1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, z: -1 }))}
                >
                  ↙
                </DirectionButton>
                <DirectionButton
                  active={currentDirection.x === 1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, x: 1 }))}
                >
                  →
                </DirectionButton>
                <DirectionButton
                  active={currentDirection.y === 1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, y: 1 }))}
                >
                  ↓
                </DirectionButton>
                <DirectionButton
                  active={currentDirection.z === 1}
                  onClick={() => setCurrentDirection(prev => ({ ...prev, z: 1 }))}
                >
                  ↘
                </DirectionButton>
              </DirectionControl>
              <Button onClick={applyCurrent}>Apply Current</Button>
            </CurrentControl>
          )}
          <StatusBar>
            <span>Stream {stream.id}</span>
            <span>Quality: {streamQualities[stream.id] || stream.quality}</span>
          </StatusBar>
          <Controls>
            <Button onClick={() => toggleFullscreen(stream.id)}>
              {fullscreenWindow === stream.id ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
            <QualitySelector
              value={streamQualities[stream.id] || stream.quality}
              onChange={(e) => updateStreamQuality(stream.id, e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </QualitySelector>
            {recordings.find(r => r.uav_id === stream.uav_id) ? (
              <Button onClick={() => stopRecording(recordings.find(r => r.uav_id === stream.uav_id)!.id)}>
                Stop Recording
              </Button>
            ) : (
              <Button onClick={() => startRecording(stream.id)}>
                Start Recording
              </Button>
            )}
          </Controls>
        </VideoWindow>
      ))}
    </MonitorContainer>
  );
};

export default FisheryMonitor; 