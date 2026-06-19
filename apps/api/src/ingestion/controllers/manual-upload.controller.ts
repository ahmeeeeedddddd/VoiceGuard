import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ManualUploadService } from '../services/manual-upload.service';

@Controller('ingestion/upload')
export class ManualUploadController {
  constructor(private readonly uploadService: ManualUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.handleUpload(file);
  }
}
