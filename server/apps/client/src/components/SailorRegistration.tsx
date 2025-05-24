import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Slider,
    Switch,
    FormControlLabel
} from '@mui/material';
import { AccountCircle, Payments, TrendingUp, LocalShipping, Eco, Security, Savings } from '@mui/icons-material';

interface SailorProfile {
    id: string;
    name: string;
    license: string;
    experience: number;
    preferredSpecies: string[];
    investmentPortfolio: {
        species: string;
        amount: number;
        performance: number;
    }[];
    earnings: {
        immediate: number;
        invested: number;
    };
}

interface InvestmentIndex {
    name: string;
    description: string;
    risk_level: string;
    expected_return: number;
    species_included: string[];
    performance_history: Array<{
        timestamp: string;
        return: number;
    }>;
}

interface FishHealthMetrics {
    species: string;
    population_health: number;
    conservation_status: string;
    habitat_quality: number;
    reproduction_rate: number;
    last_updated: string;
    location: {
        lat: number;
        lon: number;
    };
    data_source: string;
}

interface SavingsAccount {
    balance: number;
    interest_rate: number;
    daily_interest: number;
    last_interest_payment: string;
    safety_threshold: number;
    auto_reinvest: boolean;
    investment_pots: Record<string, number>;
}

interface MarketMetrics {
    timestamp: string;
    market_health: number;
    volatility: number;
    trend: string;
    recommended_action: string;
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

export const SailorRegistration: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [profile, setProfile] = useState<SailorProfile>({
        id: '',
        name: '',
        license: '',
        experience: 0,
        preferredSpecies: [],
        investmentPortfolio: [],
        earnings: {
            immediate: 0,
            invested: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [investmentIndices, setInvestmentIndices] = useState<InvestmentIndex[]>([]);
    const [fishHealthData, setFishHealthData] = useState<Record<string, FishHealthMetrics>>({});
    const [selectedInvestmentType, setSelectedInvestmentType] = useState<string>('direct');
    const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
    const [marketMetrics, setMarketMetrics] = useState<MarketMetrics | null>(null);
    const [safetyThreshold, setSafetyThreshold] = useState(30);
    const [autoReinvest, setAutoReinvest] = useState(true);
    const [investmentAllocation, setInvestmentAllocation] = useState<Record<string, number>>({});

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // TODO: Implement API call to update profile
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInvestment = async (species: string, amount: number) => {
        setLoading(true);
        try {
            // TODO: Implement API call to process investment
            setSuccess(`Successfully invested ${amount} in ${species}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process investment');
        } finally {
            setLoading(false);
        }
    };

    const handlePayout = async (amount: number) => {
        setLoading(true);
        try {
            // TODO: Implement API call to process payout
            setSuccess(`Successfully processed payout of ${amount}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process payout');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch investment indices
        const fetchInvestmentIndices = async () => {
            try {
                const response = await fetch('http://localhost:8001/investment-indices');
                const data = await response.json();
                setInvestmentIndices(data);
            } catch (err) {
                setError('Failed to fetch investment options');
            }
        };

        fetchInvestmentIndices();
    }, []);

    const fetchFishHealthData = async (species: string) => {
        try {
            const response = await fetch(
                `http://localhost:8001/fish-health/${species}?lat=0&lon=0`
            );
            const data = await response.json();
            setFishHealthData(prev => ({
                ...prev,
                [species]: data
            }));
        } catch (err) {
            setError(`Failed to fetch health data for ${species}`);
        }
    };

    useEffect(() => {
        // Fetch savings account data
        const fetchSavingsAccount = async () => {
            try {
                const response = await fetch(`http://localhost:8001/savings/${profile.id}`);
                const data = await response.json();
                setSavingsAccount(data);
                setSafetyThreshold(data.safety_threshold * 100);
                setAutoReinvest(data.auto_reinvest);
                setInvestmentAllocation(data.investment_pots);
            } catch (err) {
                setError('Failed to fetch savings account data');
            }
        };

        // Fetch market metrics
        const fetchMarketMetrics = async () => {
            try {
                const response = await fetch('http://localhost:8001/market-metrics');
                const data = await response.json();
                setMarketMetrics(data);
            } catch (err) {
                setError('Failed to fetch market metrics');
            }
        };

        if (profile.id) {
            fetchSavingsAccount();
            fetchMarketMetrics();
        }
    }, [profile.id]);

    const handleSavingsSettingsUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8001/savings/${profile.id}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    safety_threshold: safetyThreshold / 100,
                    auto_reinvest: autoReinvest,
                    investment_pots: investmentAllocation
                }),
            });
            const data = await response.json();
            setSavingsAccount(data);
            setSuccess('Savings settings updated successfully');
        } catch (err) {
            setError('Failed to update savings settings');
        }
    };

    const handleRebalance = async () => {
        try {
            await fetch(`http://localhost:8001/savings/${profile.id}/rebalance`, {
                method: 'POST',
            });
            setSuccess('Portfolio rebalanced successfully');
        } catch (err) {
            setError('Failed to rebalance portfolio');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab icon={<AccountCircle />} label="Profile" />
                    <Tab icon={<Payments />} label="Earnings" />
                    <Tab icon={<TrendingUp />} label="Investments" />
                    <Tab icon={<LocalShipping />} label="Fishing History" />
                    <Tab icon={<Eco />} label="Fish Health" />
                    <Tab icon={<Savings />} label="Savings" />
                </Tabs>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
                <form onSubmit={handleProfileUpdate}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Fishing License"
                                value={profile.license}
                                onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Preferred Species</InputLabel>
                                <Select
                                    multiple
                                    value={profile.preferredSpecies}
                                    onChange={(e) => setProfile({ 
                                        ...profile, 
                                        preferredSpecies: e.target.value as string[] 
                                    })}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    <MenuItem value="Bass">Bass</MenuItem>
                                    <MenuItem value="Trout">Trout</MenuItem>
                                    <MenuItem value="Salmon">Salmon</MenuItem>
                                    <MenuItem value="Tilapia">Tilapia</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Immediate Earnings</Typography>
                                <Typography variant="h4">${profile.earnings.immediate}</Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => handlePayout(profile.earnings.immediate)}
                                    disabled={loading || profile.earnings.immediate <= 0}
                                >
                                    Request Payout
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Invested Earnings</Typography>
                                <Typography variant="h4">${profile.earnings.invested}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Growing with fish populations
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Investment Type</InputLabel>
                            <Select
                                value={selectedInvestmentType}
                                onChange={(e) => setSelectedInvestmentType(e.target.value as string)}
                            >
                                <MenuItem value="direct">Direct Species Investment</MenuItem>
                                {investmentIndices.map((index) => (
                                    <MenuItem key={index.name} value={index.name}>
                                        {index.name} ({index.risk_level} risk)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {selectedInvestmentType === 'direct' ? (
                        profile.investmentPortfolio.map((investment, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{investment.species}</Typography>
                                        <Typography variant="h4">${investment.amount}</Typography>
                                        <Typography 
                                            variant="body2" 
                                            color={investment.performance >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            Performance: {investment.performance}%
                                        </Typography>
                                        {fishHealthData[investment.species] && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2">
                                                    Population Health: {fishHealthData[investment.species].population_health}%
                                                </Typography>
                                                <Typography variant="body2">
                                                    Conservation Status: {fishHealthData[investment.species].conservation_status}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleInvestment(investment.species, 100)}
                                            disabled={loading}
                                            sx={{ mt: 1 }}
                                        >
                                            Add Investment
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        investmentIndices
                            .filter(index => index.name === selectedInvestmentType)
                            .map((index) => (
                                <Grid item xs={12} key={index.name}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{index.name}</Typography>
                                            <Typography variant="body1">{index.description}</Typography>
                                            <Typography variant="body2">
                                                Risk Level: {index.risk_level}
                                            </Typography>
                                            <Typography variant="body2">
                                                Expected Return: {(index.expected_return * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2">
                                                Included Species: {index.species_included.join(', ')}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleInvestment(index.name, 1000)}
                                                disabled={loading}
                                                sx={{ mt: 2 }}
                                            >
                                                Invest in Fund
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                    )}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                    Recent Fishing Activity
                </Typography>
                {/* TODO: Implement fishing history display */}
                <Typography variant="body2" color="text.secondary">
                    No recent activity
                </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                <Grid container spacing={2}>
                    {Object.entries(fishHealthData).map(([species, data]) => (
                        <Grid item xs={12} md={6} key={species}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{species}</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                            Population Health: {data.population_health}%
                                        </Typography>
                                        <Typography variant="body2">
                                            Conservation Status: {data.conservation_status}
                                        </Typography>
                                        <Typography variant="body2">
                                            Habitat Quality: {data.habitat_quality}%
                                        </Typography>
                                        <Typography variant="body2">
                                            Reproduction Rate: {data.reproduction_rate}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last Updated: {new Date(data.last_updated).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">High-Yield Savings Account</Typography>
                                {savingsAccount && (
                                    <>
                                        <Typography variant="h4">
                                            ${savingsAccount.balance.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Interest Rate: {(savingsAccount.interest_rate * 100).toFixed(1)}% APY
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Daily Interest: ${savingsAccount.daily_interest.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last Interest Payment: {new Date(savingsAccount.last_interest_payment).toLocaleString()}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Market Status</Typography>
                                {marketMetrics && (
                                    <>
                                        <Typography variant="body1">
                                            Market Health: {marketMetrics.market_health.toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body1">
                                            Trend: {marketMetrics.trend}
                                        </Typography>
                                        <Typography variant="body1">
                                            Volatility: {(marketMetrics.volatility * 100).toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body1" color={
                                            marketMetrics.recommended_action === 'invest' ? 'success.main' :
                                            marketMetrics.recommended_action === 'divest' ? 'error.main' :
                                            'text.primary'
                                        }>
                                            Recommended Action: {marketMetrics.recommended_action.toUpperCase()}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Savings Settings</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography gutterBottom>
                                        Safety Threshold: {safetyThreshold}%
                                    </Typography>
                                    <Slider
                                        value={safetyThreshold}
                                        onChange={(_, value) => setSafetyThreshold(value as number)}
                                        min={10}
                                        max={50}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(value) => `${value}%`}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={autoReinvest}
                                                onChange={(e) => setAutoReinvest(e.target.checked)}
                                            />
                                        }
                                        label="Auto Rebalance Portfolio"
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Investment Allocation
                                </Typography>
                                {investmentIndices.map((index) => (
                                    <Box key={index.name} sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                            {index.name}: {(investmentAllocation[index.name] * 100).toFixed(1)}%
                                        </Typography>
                                        <Slider
                                            value={investmentAllocation[index.name] * 100}
                                            onChange={(_, value) => setInvestmentAllocation(prev => ({
                                                ...prev,
                                                [index.name]: (value as number) / 100
                                            }))}
                                            min={0}
                                            max={100}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={(value) => `${value}%`}
                                        />
                                    </Box>
                                ))}

                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSavingsSettingsUpdate}
                                        disabled={loading}
                                        sx={{ mr: 1 }}
                                    >
                                        Update Settings
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleRebalance}
                                        disabled={loading}
                                    >
                                        Rebalance Now
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>
        </Paper>
    );
}; 