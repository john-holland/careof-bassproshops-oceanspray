import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { FishDetection } from '../../data/src/models/room.model';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  validationSplit: number;
  imageSize: [number, number];
}

interface TrainingData {
  image: tf.Tensor3D;
  detection: FishDetection;
}

class FishDetectionModel {
  private model: tf.LayersModel;
  private config: TrainingConfig;

  constructor(config: TrainingConfig) {
    this.config = config;
  }

  async buildModel() {
    // Load pre-trained MobileNetV2 as base model
    const baseModel = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json');
    
    // Remove the top classification layer
    const baseModelOutput = baseModel.getLayer('global_average_pooling2d_1').output;
    
    // Add custom layers for fish detection
    const customLayers = tf.layers.dense({
      units: 512,
      activation: 'relu',
      inputShape: [1280] // MobileNetV2 output shape
    });
    
    const detectionLayers = tf.layers.dense({
      units: 8, // [x, y, z, vx, vy, vz, confidence, size]
      activation: 'sigmoid'
    });

    // Create the model
    this.model = tf.model({
      inputs: baseModel.input,
      outputs: detectionLayers.apply(customLayers.apply(baseModelOutput))
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
  }

  async loadTrainingData(dataDir: string): Promise<TrainingData[]> {
    const trainingData: TrainingData[] = [];
    const imageDir = path.join(dataDir, 'images');
    const labelDir = path.join(dataDir, 'labels');

    // Read all image files
    const imageFiles = await readdir(imageDir);
    
    for (const imageFile of imageFiles) {
      if (!imageFile.endsWith('.jpg') && !imageFile.endsWith('.png')) continue;

      const imagePath = path.join(imageDir, imageFile);
      const labelPath = path.join(labelDir, imageFile.replace(/\.(jpg|png)$/, '.json'));

      try {
        // Load and preprocess image
        const imageBuffer = await readFile(imagePath);
        const imageTensor = tf.node.decodeImage(imageBuffer);
        const resizedImage = tf.image.resizeBilinear(imageTensor, this.config.imageSize);
        const normalizedImage = resizedImage.div(255.0);

        // Load detection data
        const labelBuffer = await readFile(labelPath);
        const detection: FishDetection = JSON.parse(labelBuffer.toString());

        trainingData.push({
          image: normalizedImage as tf.Tensor3D,
          detection
        });

        // Clean up tensors
        imageTensor.dispose();
        resizedImage.dispose();
      } catch (error) {
        console.error(`Error loading training data for ${imageFile}:`, error);
      }
    }

    return trainingData;
  }

  async train(dataDir: string) {
    console.log('Loading training data...');
    const trainingData = await this.loadTrainingData(dataDir);
    
    // Prepare training data
    const images = tf.stack(trainingData.map(d => d.image));
    const detections = tf.tensor2d(trainingData.map(d => [
      d.detection.position.x,
      d.detection.position.y,
      d.detection.position.z,
      d.detection.velocity.x,
      d.detection.velocity.y,
      d.detection.velocity.z,
      d.detection.confidence,
      d.detection.size
    ]));

    console.log('Starting training...');
    const history = await this.model.fit(images, detections, {
      batchSize: this.config.batchSize,
      epochs: this.config.epochs,
      validationSplit: this.config.validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
        }
      }
    });

    // Save the model
    const modelDir = path.join(__dirname, '../../models/fish_detection_model');
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }
    await this.model.save(`file://${modelDir}`);

    console.log('Training completed. Model saved to:', modelDir);
    return history;
  }

  async evaluate(testData: TrainingData[]) {
    const testImages = tf.stack(testData.map(d => d.image));
    const testDetections = tf.tensor2d(testData.map(d => [
      d.detection.position.x,
      d.detection.position.y,
      d.detection.position.z,
      d.detection.velocity.x,
      d.detection.velocity.y,
      d.detection.velocity.z,
      d.detection.confidence,
      d.detection.size
    ]));

    const evaluation = await this.model.evaluate(testImages, testDetections);
    console.log('Evaluation results:', evaluation);
    return evaluation;
  }
}

// Training configuration
const config: TrainingConfig = {
  batchSize: 32,
  epochs: 50,
  learningRate: 0.001,
  validationSplit: 0.2,
  imageSize: [224, 224]
};

// Run training
async function main() {
  const model = new FishDetectionModel(config);
  await model.buildModel();
  
  const dataDir = path.join(__dirname, '../../data/training');
  await model.train(dataDir);
}

if (require.main === module) {
  main().catch(console.error);
}

export { FishDetectionModel, TrainingConfig, TrainingData }; 