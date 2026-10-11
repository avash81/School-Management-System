import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { ResultService } from './result.service.js';

@Controller('results')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.resultService.list(req.user!.schoolId!, query);
  }

  @Get('student/:studentId')
  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  studentResults(@Req() req: AuthenticatedRequest, @Param('studentId') studentId: string) {
    return this.resultService.studentResults(req.user!.schoolId!, studentId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.resultService.findOne(req.user!.schoolId!, id);
  }

  @Get(':id/history')
  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  history(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.resultService.history(req.user!.schoolId!, id);
  }

  @Post(':id/approve')
  @RequirePermissions(PERMISSIONS.RESULTS_APPROVE)
  approve(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { remarks?: string }) {
    return this.resultService.approve(req.user!.schoolId!, req.user!.id, id, body?.remarks);
  }

  @Post(':id/publish')
  @RequirePermissions(PERMISSIONS.RESULTS_PUBLISH)
  publish(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { remarks?: string }) {
    return this.resultService.publish(req.user!.schoolId!, req.user!.id, id, body?.remarks);
  }

  @Post(':id/reopen')
  @RequirePermissions(PERMISSIONS.RESULTS_REOPEN)
  reopen(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.resultService.reopen(req.user!.schoolId!, req.user!.id, id, body?.reason);
  }
}
