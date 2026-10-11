import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  type UpdateSchoolProfileInput,
  updateSchoolProfileSchema,
  type UpdateSchoolSettingsInput,
  updateSchoolSettingsSchema,
} from '@schoolos/validation';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { SchoolService } from './school.service.js';

@Controller()
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get('schools/me')
  @RequirePermissions(PERMISSIONS.SCHOOL_SETUP_VIEW)
  getMySchool(@Req() req: AuthenticatedRequest) {
    return this.schoolService.getCurrentSchool(req.user!.schoolId!);
  }

  @Patch('schools/me')
  @RequirePermissions(PERMISSIONS.SCHOOL_MANAGE)
  updateMySchool(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateSchoolProfileSchema)) body: UpdateSchoolProfileInput,
  ) {
    return this.schoolService.updateCurrentSchool(req.user!.schoolId!, body, req.user!.id);
  }

  @Get('schools/me/settings')
  @RequirePermissions(PERMISSIONS.SCHOOL_SETUP_VIEW)
  getMySettings(@Req() req: AuthenticatedRequest) {
    return this.schoolService.getCurrentSettings(req.user!.schoolId!);
  }

  @Patch('schools/me/settings')
  @RequirePermissions(PERMISSIONS.SCHOOL_SETTINGS_MANAGE)
  updateMySettings(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateSchoolSettingsSchema)) body: UpdateSchoolSettingsInput,
  ) {
    return this.schoolService.updateCurrentSettings(req.user!.schoolId!, body, req.user!.id);
  }

  @Get('setup/status')
  @RequirePermissions(PERMISSIONS.SCHOOL_SETUP_VIEW)
  getSetupStatus(@Req() req: AuthenticatedRequest) {
    return this.schoolService.getSetupStatus(req.user!.schoolId!);
  }
}
