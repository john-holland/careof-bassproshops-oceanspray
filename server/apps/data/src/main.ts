import { NestFactory } from '@nestjs/core';
import { DataModule } from './data.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(DataModule);
  const port = process.env.DATA_SERVICE_PORT || 3001;
  await app.listen(port);
  Logger.log(`Data service is running on: http://localhost:${port}`);
}

bootstrap(); 