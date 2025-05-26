import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RepositoryModule } from './database/repositories/repository.module';
import { DataService } from './data.service';
import { DataController } from './data.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    RepositoryModule,
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class AppModule {} 