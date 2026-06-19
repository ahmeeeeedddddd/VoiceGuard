import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';

@Injectable()
export class IngestionDedupService {
  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
  ) {}

  async checkDuplicate(externalId: string): Promise<CallRecordEntity | null> {
    return this.callRecordRepo.findOne({ where: { externalId } });
  }
}
