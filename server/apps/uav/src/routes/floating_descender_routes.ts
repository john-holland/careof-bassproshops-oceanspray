import { Router } from 'express';
import { FloatingDescenderController } from '../controllers/floating_descender_controller';
import { VideoService } from '../services/video_service';
import { HeightMapService } from '../services/height_map_service';
import { EC2StorageConfig } from '../../data/src/models/uav.model';

const router = Router();

// Initialize services
const ec2Config: EC2StorageConfig = {
  bucket_name: process.env.AWS_BUCKET_NAME || '',
  region: process.env.AWS_REGION || '',
  access_key: process.env.AWS_ACCESS_KEY || '',
  secret_key: process.env.AWS_SECRET_KEY || '',
  streaming_endpoint: process.env.STREAMING_ENDPOINT || ''
};

const videoService = new VideoService(ec2Config);
const heightMapService = new HeightMapService();
const controller = new FloatingDescenderController(videoService, heightMapService);

// Routes
router.post('/deploy', (req, res) => controller.deployFloatingDescender(req, res));
router.post('/:uav_id/adjust-descent', (req, res) => controller.adjustDescent(req, res));
router.get('/:uav_id/stream', (req, res) => controller.getStreamUrl(req, res));
router.get('/:uav_id/height-map', (req, res) => controller.getHeightMapData(req, res));

export default router; 