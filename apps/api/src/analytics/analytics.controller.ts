import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../database/call-record.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @InjectRepository(CallRecordEntity)
    private callRepo: Repository<CallRecordEntity>,
  ) {}

  @Get('heatmap')
  async getHeatmapData(@Query('days') days: number = 7) {
    // This is a simplified aggregation. In a real app, you'd use a complex SQL query or a TimescaleDB.
    const records = await this.callRepo.find({
      select: ['agentId', 'score', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 100, // Just for demonstration
    });

    // Grouping logic ... (omitted for brevity, returning mock structure matching frontend)
    return {
      agents: ['Sarah M.', 'James L.', 'Elena R.', 'Mike T.', 'Anna S.', 'Robert P.'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: records // Simplified
    };
  }
}
