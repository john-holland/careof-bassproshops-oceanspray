import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Paper, 
    Slider, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert
} from '@mui/material';
import { Bluetooth, BluetoothConnected, BluetoothDisabled } from '@mui/icons-material';
import '../types/bluetooth';

interface FishData {
    timestamp: string;
    device_id: string;
    position: {
        lat: number;
        lon: number;
        depth: number;
    };
    species: string;
    size: number;
    confidence: number;
}

interface FishFinderConfig {
    detection_range: number;
    scan_interval: number;
    sensitivity: number;
    species_filter: string[];
    depth_range: [number, number];
}

export const BluetoothFishFinder: React.FC = () => {
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [fishData, setFishData] = useState<FishData[]>([]);
    const [config, setConfig] = useState<FishFinderConfig>({
        detection_range: 50,
        scan_interval: 5,
        sensitivity: 0.8,
        species_filter: [],
        depth_range: [-100, 0]
    });
    const [error, setError] = useState<string>('');

    const connectToDevice = useCallback(async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['00001234-0000-1000-8000-00805f9b34fb'] }
                ]
            });

            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
            
            // Get characteristics
            const fishDataChar = await service?.getCharacteristic('00001235-0000-1000-8000-00805f9b34fb');
            const configChar = await service?.getCharacteristic('00001236-0000-1000-8000-00805f9b34fb');

            // Set up notifications
            if (fishDataChar) {
                await fishDataChar.startNotifications();
                fishDataChar.addEventListener('characteristicvaluechanged', (event: any) => {
                    const value = new TextDecoder().decode(event.target.value);
                    const data = JSON.parse(value);
                    setFishData(prev => [...prev, data]);
                });
            }

            // Read initial config
            if (configChar) {
                const configValue = await configChar.readValue();
                const configData = JSON.parse(new TextDecoder().decode(configValue));
                setConfig(configData);
            }

            setDevice(device);
            setIsConnected(true);
            setError('');

            // Handle disconnection
            device.addEventListener('gattserverdisconnected', () => {
                setIsConnected(false);
                setDevice(null);
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to device');
        }
    }, []);

    const updateConfig = useCallback(async (newConfig: Partial<FishFinderConfig>) => {
        if (!device?.gatt?.connected) return;

        try {
            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
            const configChar = await service?.getCharacteristic('00001236-0000-1000-8000-00805f9b34fb');

            const updatedConfig = { ...config, ...newConfig };
            const configData = new TextEncoder().encode(JSON.stringify(updatedConfig));
            
            await configChar?.writeValue(configData);
            setConfig(updatedConfig);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update config');
        }
    }, [device, config]);

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={isConnected ? <BluetoothConnected /> : <Bluetooth />}
                    onClick={connectToDevice}
                    disabled={isConnected}
                >
                    {isConnected ? 'Connected' : 'Connect to Fish Finder'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isConnected && (
                <>
                    <Typography variant="h6" gutterBottom>
                        Fish Finder Configuration
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Detection Range (meters)</Typography>
                        <Slider
                            value={config.detection_range}
                            onChange={(_, value) => updateConfig({ detection_range: value as number })}
                            min={10}
                            max={200}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Sensitivity</Typography>
                        <Slider
                            value={config.sensitivity}
                            onChange={(_, value) => updateConfig({ sensitivity: value as number })}
                            min={0}
                            max={1}
                            step={0.1}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Depth Range (meters)</Typography>
                        <Slider
                            value={config.depth_range}
                            onChange={(_, value) => updateConfig({ depth_range: value as [number, number] })}
                            min={-200}
                            max={0}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Species Filter</InputLabel>
                        <Select
                            multiple
                            value={config.species_filter}
                            onChange={(e) => updateConfig({ species_filter: e.target.value as string[] })}
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

                    <Typography variant="h6" gutterBottom>
                        Recent Detections
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {fishData.map((fish, index) => (
                            <Paper key={index} sx={{ p: 1, mb: 1 }}>
                                <Typography variant="body2">
                                    Species: {fish.species}
                                </Typography>
                                <Typography variant="body2">
                                    Size: {fish.size.toFixed(2)}m
                                </Typography>
                                <Typography variant="body2">
                                    Depth: {fish.position.depth.toFixed(1)}m
                                </Typography>
                                <Typography variant="caption">
                                    {new Date(fish.timestamp).toLocaleString()}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </>
            )}
        </Paper>
    );
}; 