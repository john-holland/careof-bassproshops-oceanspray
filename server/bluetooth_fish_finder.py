from dataclasses import dataclass
from typing import List, Dict, Optional
import asyncio
from datetime import datetime
import json
import logging
from bleak import BleakServer, BleakGATTCharacteristic
import uuid

# Bluetooth Service UUIDs
FISH_FINDER_SERVICE_UUID = "00001234-0000-1000-8000-00805f9b34fb"
FISH_DATA_CHARACTERISTIC_UUID = "00001235-0000-1000-8000-00805f9b34fb"
CONFIG_CHARACTERISTIC_UUID = "00001236-0000-1000-8000-00805f9b34fb"

@dataclass
class FishFinderConfig:
    detection_range: float
    scan_interval: float
    sensitivity: float
    species_filter: List[str]
    depth_range: tuple[float, float]

class BluetoothFishFinder:
    def __init__(self, name: str = "DeepSea Fish Finder"):
        self.name = name
        self.server = None
        self.connected_devices = set()
        self.config = FishFinderConfig(
            detection_range=50.0,
            scan_interval=5.0,
            sensitivity=0.8,
            species_filter=[],
            depth_range=(-100.0, 0.0)
        )
        self.logger = logging.getLogger(__name__)

    async def start_server(self):
        self.server = BleakServer()
        
        # Define the fish finder service
        service = self.server.add_service(FISH_FINDER_SERVICE_UUID)
        
        # Add characteristics
        fish_data_char = service.add_characteristic(
            FISH_DATA_CHARACTERISTIC_UUID,
            read=True,
            write=True,
            notify=True
        )
        
        config_char = service.add_characteristic(
            CONFIG_CHARACTERISTIC_UUID,
            read=True,
            write=True
        )
        
        # Set up characteristic handlers
        @fish_data_char.on_read
        async def handle_fish_data_read(characteristic: BleakGATTCharacteristic):
            return json.dumps({
                "timestamp": datetime.now().isoformat(),
                "device_id": characteristic.service.device.address,
                "config": self.config.__dict__
            }).encode()

        @fish_data_char.on_write
        async def handle_fish_data_write(characteristic: BleakGATTCharacteristic, data: bytes):
            try:
                fish_data = json.loads(data.decode())
                self.logger.info(f"Received fish data: {fish_data}")
                # Process and store fish data
                await self.process_fish_data(fish_data)
            except Exception as e:
                self.logger.error(f"Error processing fish data: {e}")

        @config_char.on_read
        async def handle_config_read(characteristic: BleakGATTCharacteristic):
            return json.dumps(self.config.__dict__).encode()

        @config_char.on_write
        async def handle_config_write(characteristic: BleakGATTCharacteristic, data: bytes):
            try:
                new_config = json.loads(data.decode())
                self.config = FishFinderConfig(**new_config)
                self.logger.info(f"Updated config: {self.config}")
            except Exception as e:
                self.logger.error(f"Error updating config: {e}")

        # Start advertising
        await self.server.start_advertising(
            name=self.name,
            service_uuids=[FISH_FINDER_SERVICE_UUID]
        )
        
        self.logger.info(f"Fish Finder Bluetooth server started: {self.name}")

    async def process_fish_data(self, data: Dict):
        """Process and store fish detection data from mobile devices"""
        # Here you would typically:
        # 1. Validate the data
        # 2. Store it in a database
        # 3. Update any real-time displays
        # 4. Trigger any necessary alerts
        self.logger.info(f"Processing fish data: {data}")

    async def stop_server(self):
        if self.server:
            await self.server.stop()
            self.logger.info("Fish Finder Bluetooth server stopped")

    async def broadcast_fish_data(self, data: Dict):
        """Broadcast fish data to all connected devices"""
        if self.server:
            for device in self.connected_devices:
                try:
                    await self.server.notify(
                        device,
                        FISH_DATA_CHARACTERISTIC_UUID,
                        json.dumps(data).encode()
                    )
                except Exception as e:
                    self.logger.error(f"Error broadcasting to device {device}: {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fish_finder = BluetoothFishFinder()
    
    async def main():
        await fish_finder.start_server()
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            await fish_finder.stop_server()
    
    asyncio.run(main()) 