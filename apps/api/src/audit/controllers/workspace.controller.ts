import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service';

@Controller('audit/workspace')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Get(':id')
  async getWorkspaceData(@Param('id') id: string) {
    return this.workspaceService.getCallWithChecklist(id);
  }

  @Post(':id/override')
  async submitOverride(
    @Param('id') id: string,
    @Body() body: { ruleId: string; status: 'PASSED' | 'FAILED'; justification: string },
  ) {
    return this.workspaceService.submitOverride(id, body.ruleId, body.status, body.justification);
  }

  @Post(':id/note')
  async addNote(
    @Param('id') id: string,
    @Body() body: { timestamp: number; text: string },
  ) {
    return this.workspaceService.addNote(id, body.timestamp, body.text);
  }
}
