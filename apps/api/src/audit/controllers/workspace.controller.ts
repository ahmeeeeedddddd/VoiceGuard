import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@voiceguard/shared';

@Controller('audit')
@UseGuards(RolesGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Get('calls')
  async getAllCalls() {
    return this.workspaceService.getAllCalls();
  }

  @Get('workspace/:id')
  async getWorkspaceData(@Param('id') id: string) {
    // Everyone can view
    return this.workspaceService.getCallWithChecklist(id);
  }

  @Post('workspace/:id/override')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async submitOverride(
    @Param('id') id: string,
    @Body() body: { ruleId: string; status: 'PASSED' | 'FAILED'; justification: string },
  ) {
    return this.workspaceService.submitOverride(id, body.ruleId, body.status, body.justification);
  }

  @Post('workspace/:id/note')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async addNote(
    @Param('id') id: string,
    @Body() body: { timestamp: number; text: string },
  ) {
    return this.workspaceService.addNote(id, body.timestamp, body.text);
  }

  @Post('workspace/:id/submit')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async submitAudit(
    @Param('id') id: string,
    @Body() body: { auditorName: string },
  ) {
    return this.workspaceService.submitAudit(id, body.auditorName);
  }

  @Post('workspace/:id/delete') // Using POST for easier testing if DELETE is blocked
  @Roles(Role.ADMIN, Role.AUDITOR)
  async deleteCall(@Param('id') id: string) {
    return this.workspaceService.deleteCall(id);
  }
}
