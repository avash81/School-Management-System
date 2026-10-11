import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('students')
  @RequirePermissions(PERMISSIONS.REPORTS_STUDENTS)
  students(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.reportsService.students(req.user!.schoolId!, query);
  }

  @Get('results')
  @RequirePermissions(PERMISSIONS.REPORTS_RESULTS)
  results(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.reportsService.results(req.user!.schoolId!, query);
  }

  @Get('examinations')
  @RequirePermissions(PERMISSIONS.REPORTS_EXAMINATIONS)
  examinations(@Req() req: AuthenticatedRequest) {
    return this.reportsService.examinations(req.user!.schoolId!);
  }
}
