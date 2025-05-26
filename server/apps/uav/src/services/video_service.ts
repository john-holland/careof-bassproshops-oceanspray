import { VideoRecording, EC2StorageConfig, FloatingDescenderUAV } from '../../data/src/models/uav.model';
import { S3 } from 'aws-sdk';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';

export class VideoService {
  private s3: S3;
  private config: EC2StorageConfig;

  constructor(config: EC2StorageConfig) {
    this.config = config;
    this.s3 = new S3({
      region: config.region,
      accessKeyId: config.access_key,
      secretAccessKey: config.secret_key
    });
  }

  async startRecording(uav: FloatingDescenderUAV): Promise<VideoRecording> {
    const recording: VideoRecording = {
      id: Date.now(), // Temporary ID, should be replaced with proper DB ID
      uav_id: uav.id,
      start_time: new Date(),
      storage_path: `recordings/${uav.id}/${Date.now()}`,
      resolution: '1080p',
      format: 'mp4',
      size_bytes: 0,
      is_streaming: true,
      stream_url: `${this.config.streaming_endpoint}/stream/${uav.id}`
    };

    // Start video recording process
    // Implementation would depend on the specific UAV hardware and SDK
    return recording;
  }

  async stopRecording(recording: VideoRecording): Promise<VideoRecording> {
    recording.end_time = new Date();
    recording.is_streaming = false;
    
    // Stop video recording process
    // Implementation would depend on the specific UAV hardware and SDK
    return recording;
  }

  async uploadToEC2(recording: VideoRecording, filePath: string): Promise<string> {
    const key = `${recording.storage_path}.${recording.format}`;
    
    await this.s3.upload({
      Bucket: this.config.bucket_name,
      Key: key,
      Body: createReadStream(filePath)
    }).promise();

    return `https://${this.config.bucket_name}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async downloadFromEC2(recording: VideoRecording, localPath: string): Promise<void> {
    const key = `${recording.storage_path}.${recording.format}`;
    
    const response = await this.s3.getObject({
      Bucket: this.config.bucket_name,
      Key: key
    }).promise();

    if (response.Body) {
      await pipeline(
        response.Body as any,
        createWriteStream(localPath)
      );
    }
  }

  async streamToProjector(recording: VideoRecording): Promise<string> {
    // Implementation would depend on the specific projector hardware and streaming protocol
    // This is a placeholder for the actual implementation
    return `${this.config.streaming_endpoint}/projector/${recording.uav_id}`;
  }
} 