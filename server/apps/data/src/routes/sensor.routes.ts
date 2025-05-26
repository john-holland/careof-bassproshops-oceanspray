import { Router } from 'express';
import { SensorController } from '../controllers/sensor.controller';

const router = Router();
const sensorController = new SensorController();

// Sensor reading endpoints
router.post('/readings', sensorController.recordSensorReading.bind(sensorController));
router.post('/pyr', sensorController.processPYRReading.bind(sensorController));

// Current change endpoints
router.post('/current', sensorController.createCurrentChange.bind(sensorController));

// Feeding schedule endpoints
router.post('/feeding', sensorController.updateFeedingSchedule.bind(sensorController));
router.get('/feeding/:tankId/:species', sensorController.getCurrentFeedingSchedule.bind(sensorController));

// Health check endpoints
router.post('/health', sensorController.recordHealthCheck.bind(sensorController));
router.get('/health/:tankId', sensorController.getLatestHealthCheck.bind(sensorController));

// Sensor registration endpoints
router.post('/register', sensorController.registerSensor.bind(sensorController));
router.get('/registered', sensorController.getRegisteredSensors.bind(sensorController));

export default router; 