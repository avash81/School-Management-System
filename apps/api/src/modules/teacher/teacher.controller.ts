import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  createTeacherAssignmentSchema,
  createTeacherSchema,
  type TeacherAssignmentCreateInput,
  type TeacherCreateInput,
} from '@schoolos/validation';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { TeacherService } from './teacher.service.js';

@Controller('teachers')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.TEACHERS_CREATE)
  create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createTeacherSchema)) body: TeacherCreateInput,
  ) {
    return this.teacherService.create(req.user!.schoolId!, req.user!.id, body);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.TEACHERS_READ)
  list(@Req() req: AuthenticatedRequest) {
    return this.teacherService.list(req.user!.schoolId!);
  }

  @Get('assignments')
  @RequirePermissions(PERMISSIONS.TEACHERS_READ)
  listAssignments(@Req() req: AuthenticatedRequest) {
    return this.teacherService.listAssignments(req.user!.schoolId!);
  }

  @Get(':id/assignments')
  @RequirePermissions(PERMISSIONS.TEACHERS_READ)
  teacherAssignments(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.teacherService
      .listAssignments(req.user!.schoolId!)
      .then((items) => items.filter((item) => item.teacherId === id));
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.TEACHERS_READ)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.teacherService.findOne(req.user!.schoolId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.TEACHERS_UPDATE)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.teacherService.update(req.user!.schoolId!, id, body);
  }

  @Post(':id/photo')
  @RequirePermissions(PERMISSIONS.TEACHERS_DOCUMENTS_MANAGE)
  uploadPhoto(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.teacherService.findOne(req.user!.schoolId!, id);
  }

  @Post(':id/signature')
  @RequirePermissions(PERMISSIONS.TEACHERS_DOCUMENTS_MANAGE)
  uploadSignature(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.teacherService.findOne(req.user!.schoolId!, id);
  }

  @Post(':id/documents')
  @RequirePermissions(PERMISSIONS.TEACHERS_DOCUMENTS_MANAGE)
  uploadDocument(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() _body: Record<string, unknown>,
  ) {
    return this.teacherService.findOne(req.user!.schoolId!, id);
  }

  @Post('assignments')
  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.TEACHERS_ASSIGNMENTS_MANAGE)
  createAssignment(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createTeacherAssignmentSchema)) body: TeacherAssignmentCreateInput,
  ) {
    return this.teacherService.createAssignment(req.user!.schoolId!, req.user!.id, body);
  }

  @Get(':id/workload')
  @RequirePermissions(PERMISSIONS.TEACHERS_READ)
  workload(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.teacherService.workload(req.user!.schoolId!, id);
  }
}
