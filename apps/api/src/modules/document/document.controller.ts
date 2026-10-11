import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { DocumentService } from './document.service.js';

@Controller('marksheets')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.DOCUMENTS_TEMPLATES_MANAGE)
  @Post('templates')
  createTemplate(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.documentService.createTemplate(req.user!.schoolId!, req.user!.id, body); }

  @UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_READ)
  @Post('preview')
  preview(@Req() req: AuthenticatedRequest, @Body() body: { examId: string; studentId: string }) { return this.documentService.preview(req.user!.schoolId!, body.examId, body.studentId); }

  @UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.DOCUMENTS_GENERATE)
  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() body: { examId: string; studentId: string }) { return this.documentService.generate(req.user!.schoolId!, req.user!.id, body.examId, body.studentId); }

  @UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.DOCUMENTS_GENERATE)
  @Post('generate-bulk')
  generateBulk(@Req() req: AuthenticatedRequest, @Body() body: { examId: string }) { return this.documentService.generateBulk(req.user!.schoolId!, req.user!.id, body.examId); }

  @Throttle({ 'auth-public': { limit: 60, ttl: 60_000 } })
  @Get('verify/:verificationCode')
  verifyDocument(@Param('verificationCode') verificationCode: string) { return this.documentService.verifyDocument(verificationCode); }

  @UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_READ)
  @Get(':id')
  getDocument(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.documentService.getDocument(req.user!.schoolId!, id); }
}
