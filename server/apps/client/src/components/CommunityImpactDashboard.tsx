import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    Button
} from '@mui/material';
import {
    EmojiEvents,
    LocationOn,
    People,
    Public,
    Add as AddIcon,
    TrendingUp
} from '@mui/icons-material';

interface LeaderboardEntry {
    profile_id: string;
    name: string;
    score: number;
    rank: number;
    impact_metrics: {
        investment: number;
        sustainable_catches: number;
        conservation: number;
        local_food: number;
    };
    distance?: number;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const CommunityImpactDashboard: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchRadius, setSearchRadius] = useState(50);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [friendSearch, setFriendSearch] = useState('');

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }

        // Fetch leaderboards
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        setLoading(true);
        try {
            // Fetch global leaderboard
            const globalResponse = await fetch('http://localhost:8001/leaderboard/global');
            const globalData = await globalResponse.json();
            setGlobalLeaderboard(globalData);

            // Fetch local leaderboard if location is available
            if (userLocation) {
                const localResponse = await fetch(
                    `http://localhost:8001/leaderboard/local?lat=${userLocation.lat}&lon=${userLocation.lon}&radius_km=${searchRadius}`
                );
                const localData = await localResponse.json();
                setLocalLeaderboard(localData);
            }

            // Fetch friends leaderboard
            const friendsResponse = await fetch('http://localhost:8001/leaderboard/friends/current-user');
            const friendsData = await friendsResponse.json();
            setFriendsLeaderboard(friendsData);
        } catch (err) {
            setError('Failed to fetch leaderboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAddFriend = async (friendId: string) => {
        try {
            await fetch(`http://localhost:8001/friends/current-user/${friendId}`, {
                method: 'POST'
            });
            fetchLeaderboards(); // Refresh leaderboards
        } catch (err) {
            setError('Failed to add friend');
        }
    };

    const renderLeaderboardEntry = (entry: LeaderboardEntry, showDistance: boolean = false) => (
        <ListItem key={entry.profile_id}>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: entry.rank <= 3 ? 'primary.main' : 'grey.500' }}>
                    {entry.rank}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={entry.name}
                secondary={
                    <Box>
                        <Typography variant="body2" component="span">
                            Score: {entry.score.toFixed(0)}
                        </Typography>
                        {showDistance && entry.distance && (
                            <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                                {entry.distance.toFixed(1)}km away
                            </Typography>
                        )}
                    </Box>
                }
            />
            <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={<TrendingUp />}
                        label={`$${entry.impact_metrics.investment.toFixed(0)}`}
                        size="small"
                    />
                    <Chip
                        label={`${entry.impact_metrics.sustainable_catches} catches`}
                        size="small"
                    />
                    <IconButton
                        edge="end"
                        onClick={() => handleAddFriend(entry.profile_id)}
                        disabled={friendsLeaderboard.some(f => f.profile_id === entry.profile_id)}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>
            </ListItemSecondaryAction>
        </ListItem>
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Community Impact Dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab icon={<Public />} label="Global" />
                    <Tab icon={<LocationOn />} label="Local" />
                    <Tab icon={<People />} label="Friends" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Global Leaderboard
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {globalLeaderboard.map(entry => renderLeaderboardEntry(entry))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Local Leaderboard
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                type="number"
                                label="Search Radius (km)"
                                value={searchRadius}
                                onChange={(e) => setSearchRadius(Number(e.target.value))}
                                sx={{ mr: 2 }}
                            />
                            <Button
                                variant="contained"
                                onClick={fetchLeaderboards}
                                disabled={!userLocation}
                            >
                                Update
                            </Button>
                        </Box>
                        {!userLocation ? (
                            <Alert severity="info">
                                Please enable location services to view the local leaderboard
                            </Alert>
                        ) : loading ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {localLeaderboard.map(entry => renderLeaderboardEntry(entry, true))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Friends Leaderboard
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Add Friend"
                                value={friendSearch}
                                onChange={(e) => setFriendSearch(e.target.value)}
                                sx={{ mr: 2 }}
                            />
                            <Button
                                variant="contained"
                                onClick={() => handleAddFriend(friendSearch)}
                                disabled={!friendSearch}
                            >
                                Add Friend
                            </Button>
                        </Box>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {friendsLeaderboard.map(entry => renderLeaderboardEntry(entry))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </TabPanel>
        </Paper>
    );
}; 