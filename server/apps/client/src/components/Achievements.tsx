import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  Close as CloseIcon,
  DirectionsBoat,
  Rocket,
  LocalFireDepartment,
  Public,
  SolarPower,
} from '@mui/icons-material';
import axios from 'axios';

interface Achievement {
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const achievementIcons: { [key: string]: React.ReactNode } = {
  'Fish Found!': <DirectionsBoat />,
  'UAV Unstuck!': <Rocket />,
  'Local Hero': <LocalFireDepartment />,
  'Global Hero': <Public />,
  'Launch UAV!': <Rocket />,
  'Solar Cleaner': <SolarPower />,
};

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchAchievements();
    // Set up WebSocket connection for real-time achievement updates
    const ws = new WebSocket('ws://localhost:5000/ws/achievements');
    
    ws.onmessage = (event) => {
      const achievement = JSON.parse(event.data);
      setNewAchievement(achievement);
      setShowNotification(true);
      fetchAchievements(); // Refresh the list
    };

    return () => ws.close();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/achievements');
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewAchievement(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Achievement Notification */}
      <Fade in={showNotification}>
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {newAchievement && (
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                border: `1px solid ${theme.palette.primary.light}`,
                boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                minWidth: 300,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zoom in={true}>
                    <Badge
                      badgeContent="New!"
                      color="secondary"
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: 'pulse 2s infinite',
                        },
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 40, color: theme.palette.primary.light }} />
                    </Badge>
                  </Zoom>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {newAchievement.type}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {newAchievement.description}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleCloseNotification}
                    sx={{ color: 'white' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Fade>

      {/* Achievements List */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
        {achievements.map((achievement, index) => (
          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={achievement.timestamp}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                border: `1px solid ${theme.palette.primary.main}40`,
                boxShadow: `0 0 10px ${theme.palette.primary.main}20`,
                minWidth: 200,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title={achievement.type}>
                    <Box sx={{ color: theme.palette.primary.main }}>
                      {achievementIcons[achievement.type] || <EmojiEvents />}
                    </Box>
                  </Tooltip>
                  <Box>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                      {achievement.type}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {achievement.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {new Date(achievement.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        ))}
      </Box>
    </Box>
  );
}; 