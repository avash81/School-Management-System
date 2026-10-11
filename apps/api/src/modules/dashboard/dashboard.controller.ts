import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.DASHBOARD_SUMMARY)
  getSummary(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getSummary(req.user!.schoolId!);
  }

  @Get('examination-progress')
  @RequirePermissions(PERMISSIONS.DASHBOARD_SUMMARY)
  getExaminationProgress(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getExaminationProgress(req.user!.schoolId!);
  }

  @Get('pending-actions')
  @RequirePermissions(PERMISSIONS.DASHBOARD_SUMMARY)
  getPendingActions(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getPendingActions(req.user!.schoolId!);
  }

  @Get('recent-activity')
  @RequirePermissions(PERMISSIONS.DASHBOARD_SUMMARY)
  getRecentActivity(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getRecentActivity(req.user!.schoolId!);
  }
}
