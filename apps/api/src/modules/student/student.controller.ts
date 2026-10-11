import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { StudentService } from './student.service.js';

@Controller('students')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.STUDENTS_CREATE)
  create(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.studentService.create(req.user!.schoolId!, req.user!.id, body);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.STUDENTS_READ)
  list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.studentService.list(req.user!.schoolId!, query);
  }

  @Get('search')
  @RequirePermissions(PERMISSIONS.STUDENTS_READ)
  search(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.studentService.fts(req.user!.schoolId!, query);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.STUDENTS_UPDATE)
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.studentService.update(req.user!.schoolId!, req.user!.id, id, body);
  }

  @Get(':id/enrollments')
  @RequirePermissions(PERMISSIONS.STUDENTS_READ)
  getEnrollments(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.studentService.enrollments(req.user!.schoolId!, id);
  }

  @Post(':id/enrollments')
  @RequirePermissions(PERMISSIONS.STUDENTS_ENROLLMENTS_MANAGE)
  createEnrollment(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.studentService.createEnrollment(req.user!.schoolId!, req.user!.id, id, body);
  }

  @Post('import')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT)
  importStudents(@Req() req: AuthenticatedRequest, @Body() body: { rows?: unknown[] }) {
    return this.studentService.importPreview(req.user!.schoolId!, req.user!.id, body.rows ?? []);
  }

  @Get('import/:jobId')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT)
  importStatus(@Req() req: AuthenticatedRequest, @Param('jobId') jobId: string) {
    return this.studentService.importStatus(req.user!.schoolId!, jobId);
  }

  @Post('import/:jobId/confirm')
  @RequirePermissions(PERMISSIONS.STUDENTS_IMPORT, PERMISSIONS.STUDENTS_CREATE)
  confirmImport(@Req() req: AuthenticatedRequest, @Param('jobId') jobId: string) {
    return this.studentService.confirmImport(req.user!.schoolId!, req.user!.id, jobId);
  }

  @Get(':id/guardians')
  @RequirePermissions(PERMISSIONS.STUDENTS_READ)
  getGuardians(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.studentService.guardians(req.user!.schoolId!, id);
  }

  @Post(':id/guardians')
  @RequirePermissions(PERMISSIONS.STUDENTS_GUARDIANS_MANAGE)
  addGuardian(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.studentService.createGuardian(req.user!.schoolId!, req.user!.id, id, body);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.STUDENTS_READ)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.studentService.findOne(req.user!.schoolId!, id);
  }
}
