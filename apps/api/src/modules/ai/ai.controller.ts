import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { AiService } from './ai.service.js';

@Controller('ai')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('reviews')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  list(@Req() req: AuthenticatedRequest, @Query('type') type?: 'students' | 'marks') {
    return this.aiService.listSessions(req.user!.schoolId!, type);
  }

  @Get('reviews/:sessionId')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  getSession(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string) {
    return this.aiService.getSession(req.user!.schoolId!, sessionId);
  }

  @Post('reviews/:sessionId/approve')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  approveSession(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string, @Body() body: { reason?: string }) {
    return this.aiService.approveSession(req.user!.schoolId!, req.user!.id, sessionId, body?.reason);
  }

  @Post('reviews/:sessionId/reject')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  rejectSession(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string, @Body() body: { reason: string }) {
    return this.aiService.rejectSession(req.user!.schoolId!, req.user!.id, sessionId, body.reason);
  }

  @Post('reviews/:sessionId/records/:recordId/approve')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  approveRecord(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string, @Param('recordId') recordId: string) {
    return this.aiService.approveRecord(req.user!.schoolId!, req.user!.id, sessionId, recordId);
  }

  @Post('reviews/:sessionId/records/:recordId/reject')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.MARKS_IMPORT)
  rejectRecord(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string, @Param('recordId') recordId: string, @Body() body: { reason: string }) {
    return this.aiService.rejectRecord(req.user!.schoolId!, req.user!.id, sessionId, recordId, body.reason);
  }
}
