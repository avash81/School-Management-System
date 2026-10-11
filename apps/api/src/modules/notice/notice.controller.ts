import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { NoticeService } from './notice.service.js';

@Controller('notices')
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.NOTICES_READ)
  list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.noticeService.list(req.user!.schoolId!, query);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.NOTICES_CREATE)
  create(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.noticeService.create(req.user!.schoolId!, req.user!.id, body);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.NOTICES_READ)
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noticeService.get(req.user!.schoolId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.NOTICES_UPDATE)
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.noticeService.update(req.user!.schoolId!, req.user!.id, id, body);
  }

  @Post(':id/publish')
  @RequirePermissions(PERMISSIONS.NOTICES_PUBLISH)
  publish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noticeService.publish(req.user!.schoolId!, req.user!.id, id);
  }

  @Post(':id/archive')
  @RequirePermissions(PERMISSIONS.NOTICES_ARCHIVE)
  archive(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noticeService.archive(req.user!.schoolId!, req.user!.id, id);
  }
}
