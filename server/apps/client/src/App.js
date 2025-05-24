import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  ThemeProvider,
  CssBaseline,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Refresh, 
  QrCode2,
  QrCodeScanner,
  Stars,
  Rocket,
  Science,
  People,
  EmojiEvents,
  ShoppingCart
} from '@mui/icons-material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';
import { QRRouter } from './components/QRRouter';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BluetoothFishFinder } from './components/BluetoothFishFinder';
import { SailorRegistration } from './components/SailorRegistration';
import { CommunityImpactDashboard } from './components/CommunityImpactDashboard';
import { theme } from './theme';
import { Achievements } from './components/Achievements';
import { Store } from './components/Store';

// 3D Components
const Tank = ({ size }) => (
  <mesh>
    <boxGeometry args={[size.x, size.y, size.z]} />
    <meshStandardMaterial color="#88ccff" transparent opacity={0.3} />
  </mesh>
);

const Robot = ({ position, batteryLevel }) => (
  <mesh position={[position[0], position[1], position[2]]}>
    <sphereGeometry args={[0.2]} />
    <meshStandardMaterial color={batteryLevel > 0.2 ? "#00ff00" : "#ff0000"} />
  </mesh>
);

const Fish = ({ position }) => (
  <mesh position={[position[0], position[1], position[2]]}>
    <coneGeometry args={[0.1, 0.3]} />
    <meshStandardMaterial color="#ff9900" />
  </mesh>
);

function SimulationView() {
  const [simulationData, setSimulationData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [tankReadings, setTankReadings] = useState({});

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(fetchSimulationData, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchSimulationData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/simulation/status');
      setSimulationData(response.data);
    } catch (error) {
      console.error('Error fetching simulation data:', error);
    }
  };

  const handleQRScan = async (result) => {
    if (result) {
      try {
        const response = await axios.post('http://localhost:5000/api/mobile/connect', {
          ...JSON.parse(result.text)
        });
        setConnectionStatus('connected');
        setShowScanner(false);
      } catch (error) {
        console.error('Error connecting to simulation:', error);
      }
    }
  };

  const generateQR = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/qr/generate');
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleTankReading = (reading) => {
    setTankReadings(prev => ({
      ...prev,
      [reading.tank_id]: reading
    }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {/* 3D Visualization */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                height: '600px', 
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(0,180,216,0.1) 0%, rgba(0,119,182,0.1) 100%)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }
              }}
            >
              <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Tank size={{ x: 10, y: 10, z: 5 }} />
                {simulationData?.robots.map(robot => (
                  <Robot 
                    key={robot.id}
                    position={robot.position}
                    batteryLevel={robot.battery_level}
                  />
                ))}
                {simulationData?.fish_data && Object.values(simulationData.fish_data).map((fish, index) => (
                  <Fish 
                    key={index}
                    position={fish[fish.length - 1]?.position || [0, 0, 0]}
                  />
                ))}
                <OrbitControls />
              </Canvas>
            </Paper>
          </Grid>

          {/* Control Panel */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2,
                background: 'linear-gradient(135deg, rgba(2,62,138,0.9) 0%, rgba(3,4,94,0.9) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'primary.main',
                  textShadow: '0 0 10px rgba(0,180,216,0.5)',
                }}
              >
                <Science /> Control Panel
              </Typography>
              
              {/* Tank QR Scanner */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ color: 'text.secondary' }}
                >
                  Tank Scanner
                </Typography>
                <QRRouter onReadingReceived={handleTankReading} />
              </Box>

              {/* Tank Readings Display */}
              {Object.values(tankReadings).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{ color: 'text.secondary' }}
                  >
                    Tank Readings
                  </Typography>
                  {Object.values(tankReadings).map(reading => (
                    <Card 
                      key={reading.tank_id} 
                      sx={{ 
                        mb: 1,
                        background: 'linear-gradient(135deg, rgba(2,62,138,0.8) 0%, rgba(3,4,94,0.8) 100%)',
                        border: '1px solid rgba(0,180,216,0.2)',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6"
                          sx={{ color: 'primary.main' }}
                        >
                          Tank {reading.tank_id}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Pressure: {reading.pressure} atm
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Temperature: {reading.temperature}°C
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          pH: {reading.water_quality.ph}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Oxygen: {reading.water_quality.oxygen} mg/L
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Salinity: {reading.water_quality.salinity} ppt
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Fish Count: {reading.fish_count}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Mobile Connection */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ color: 'text.secondary' }}
                >
                  Mobile Connection
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<QrCode2 />}
                  onClick={generateQR}
                  sx={{ mr: 1 }}
                >
                  Generate QR
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={() => setShowScanner(!showScanner)}
                >
                  Scan QR
                </Button>
                {showQR && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                    <QRCode value={JSON.stringify({
                      simulation_id: simulationData?.simulation_id,
                      timestamp: new Date().toISOString()
                    })} />
                  </Box>
                )}
                {showScanner && (
                  <Box sx={{ mt: 2 }}>
                    <QrReader
                      onResult={handleQRScan}
                      style={{ width: '100%' }}
                    />
                  </Box>
                )}
              </Box>

              {/* Status Information */}
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ color: 'text.secondary' }}
                >
                  Status
                </Typography>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(2,62,138,0.8) 0%, rgba(3,4,94,0.8) 100%)',
                    border: '1px solid rgba(0,180,216,0.2)',
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Connection: {connectionStatus}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Active Robots: {simulationData?.robots.filter(r => r.battery_level > 0.1).length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tracked Fish: {Object.keys(simulationData?.fish_data || {}).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar 
          position="static"
          sx={{
            background: 'linear-gradient(90deg, rgba(3,4,94,0.95) 0%, rgba(2,62,138,0.95) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'primary.main',
                textShadow: '0 0 10px rgba(0,180,216,0.5)',
              }}
            >
              <Stars /> Bass Pro Shops Simulation
            </Typography>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              startIcon={<Rocket />}
            >
              Simulation
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/fish-finder"
              startIcon={<Science />}
            >
              Fish Finder
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/sailor-registration"
              startIcon={<People />}
            >
              Sailor Registration
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/community"
              startIcon={<EmojiEvents />}
            >
              Community
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/achievements"
              startIcon={<EmojiEvents />}
            >
              Achievements
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/store"
              startIcon={<ShoppingCart />}
            >
              Store
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<SimulationView />} />
            <Route path="/tank/:id" element={<TankDetails />} />
            <Route path="/fish-finder" element={<BluetoothFishFinder />} />
            <Route path="/sailor-registration" element={<SailorRegistration />} />
            <Route path="/community" element={<CommunityImpactDashboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/store" element={<Store />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 