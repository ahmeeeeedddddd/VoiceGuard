import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallRecordEntity } from '../database/call-record.entity';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CallRecordEntity])],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
