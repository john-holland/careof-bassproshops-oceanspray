import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { FishDetection } from '../../data/src/models/room.model';

const execAsync = promisify(exec);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface FrameData {
  timestamp: number;
  frameNumber: number;
  detections: FishDetection[];
}

class TrainingDataPreparator {
  private readonly outputDir: string;
  private readonly frameInterval: number; // milliseconds between frames

  constructor(outputDir: string, frameInterval: number = 1000) {
    this.outputDir = outputDir;
    this.frameInterval = frameInterval;
  }

  async prepareDirectories() {
    const dirs = [
      path.join(this.outputDir, 'images'),
      path.join(this.outputDir, 'labels'),
      path.join(this.outputDir, 'frames')
    ];

    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
  }

  async extractFrames(videoPath: string) {
    const framesDir = path.join(this.outputDir, 'frames');
    const framePattern = path.join(framesDir, 'frame_%04d.jpg');

    // Extract frames using FFmpeg
    await execAsync(`ffmpeg -i "${videoPath}" -vf "fps=1/${this.frameInterval/1000}" "${framePattern}"`);
  }

  async processFrame(framePath: string, frameNumber: number): Promise<FrameData> {
    // Load frame as tensor
    const imageBuffer = await fs.promises.readFile(framePath);
    const imageTensor = tf.node.decodeImage(imageBuffer);
    
    // Basic fish detection using color thresholding and contour detection
    // This is a simplified version - in practice, you'd want to use a more sophisticated approach
    const [height, width] = imageTensor.shape;
    const thresholded = tf.tidy(() => {
      // Convert to grayscale
      const grayscale = tf.image.rgbToGrayscale(imageTensor);
      // Apply threshold
      const threshold = tf.scalar(0.5);
      return tf.greater(grayscale, threshold);
    });

    // Find contours (simplified)
    const contours = await this.findContours(thresholded);
    
    // Convert contours to fish detections
    const detections: FishDetection[] = contours.map((contour, index) => ({
      id: Date.now() + index,
      tank_id: 1,
      timestamp: new Date(),
      fish_id: `fish_${frameNumber}_${index}`,
      position: {
        x: contour.center.x / width,
        y: contour.center.y / height,
        z: 0 // Depth would require stereo vision or other sensors
      },
      velocity: {
        x: 0, // Would require tracking between frames
        y: 0,
        z: 0
      },
      confidence: contour.area / (width * height),
      species: 'unknown',
      size: Math.sqrt(contour.area),
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Clean up tensors
    imageTensor.dispose();
    thresholded.dispose();

    return {
      timestamp: Date.now(),
      frameNumber,
      detections
    };
  }

  private async findContours(binaryImage: tf.Tensor): Promise<Array<{ center: { x: number, y: number }, area: number }>> {
    // This is a simplified version - in practice, you'd want to use a proper contour detection algorithm
    const [height, width] = binaryImage.shape;
    const data = await binaryImage.data();
    
    const contours: Array<{ center: { x: number, y: number }, area: number }> = [];
    const visited = new Set<number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (data[idx] > 0 && !visited.has(idx)) {
          // Simple flood fill to find connected components
          const { center, area } = this.floodFill(data, width, height, x, y, visited);
          if (area > 100) { // Minimum area threshold
            contours.push({ center, area });
          }
        }
      }
    }

    return contours;
  }

  private floodFill(
    data: Float32Array | Int32Array | Uint8Array,
    width: number,
    height: number,
    startX: number,
    startY: number,
    visited: Set<number>
  ): { center: { x: number, y: number }, area: number } {
    const queue: [number, number][] = [[startX, startY]];
    let sumX = 0;
    let sumY = 0;
    let area = 0;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const idx = y * width + x;

      if (visited.has(idx)) continue;
      visited.add(idx);

      if (data[idx] > 0) {
        sumX += x;
        sumY += y;
        area++;

        // Check neighbors
        const neighbors = [
          [x + 1, y], [x - 1, y],
          [x, y + 1], [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            queue.push([nx, ny]);
          }
        }
      }
    }

    return {
      center: {
        x: sumX / area,
        y: sumY / area
      },
      area
    };
  }

  async prepareTrainingData(videoPath: string) {
    console.log('Preparing directories...');
    await this.prepareDirectories();

    console.log('Extracting frames...');
    await this.extractFrames(videoPath);

    console.log('Processing frames...');
    const framesDir = path.join(this.outputDir, 'frames');
    const frameFiles = await fs.promises.readdir(framesDir);
    
    for (const frameFile of frameFiles) {
      if (!frameFile.endsWith('.jpg')) continue;

      const frameNumber = parseInt(frameFile.match(/\d+/)?.[0] || '0');
      const framePath = path.join(framesDir, frameFile);
      
      const frameData = await this.processFrame(framePath, frameNumber);
      
      // Save processed image
      const imagePath = path.join(this.outputDir, 'images', `frame_${frameNumber.toString().padStart(4, '0')}.jpg`);
      await fs.promises.copyFile(framePath, imagePath);

      // Save detection data
      const labelPath = path.join(this.outputDir, 'labels', `frame_${frameNumber.toString().padStart(4, '0')}.json`);
      await writeFile(labelPath, JSON.stringify(frameData, null, 2));
    }

    console.log('Training data preparation completed.');
  }
}

// Run data preparation
async function main() {
  const preparator = new TrainingDataPreparator(
    path.join(__dirname, '../../data/training'),
    1000 // Extract one frame per second
  );

  const videoPath = process.argv[2];
  if (!videoPath) {
    console.error('Please provide a video path');
    process.exit(1);
  }

  await preparator.prepareTrainingData(videoPath);
}

if (require.main === module) {
  main().catch(console.error);
}

export { TrainingDataPreparator }; 