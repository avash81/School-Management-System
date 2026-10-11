import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  type AcademicYearCreateInput,
  type AcademicYearUpdateInput,
  type ClassCreateInput,
  type ClassUpdateInput,
  createAcademicYearSchema,
  createClassSchema,
  createSectionSchema,
  createSubjectOfferingSchema,
  createSubjectSchema,
  type SectionCreateInput,
  type SectionUpdateInput,
  type SubjectCreateInput,
  type SubjectOfferingCreateInput,
  type SubjectUpdateInput,
  updateAcademicYearSchema,
  updateClassSchema,
  updateSectionSchema,
  updateSubjectSchema,
} from '@schoolos/validation';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { AcademicService } from './academic.service.js';

@Controller()
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @RequirePermissions(PERMISSIONS.ACADEMIC_YEARS_READ)
  @Get('academic-years')
  listAcademicYears(@Req() req: AuthenticatedRequest) {
    return this.academicService.list('academicYear', req.user!.schoolId!);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_YEARS_MANAGE)
  @Post('academic-years')
  createAcademicYear(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createAcademicYearSchema)) body: AcademicYearCreateInput,
  ) {
    return this.academicService.createAcademicYear(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_YEARS_MANAGE)
  @Patch('academic-years/:id')
  updateAcademicYear(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicYearSchema)) body: AcademicYearUpdateInput,
  ) {
    return this.academicService.updateAcademicYear(req.user!.schoolId!, req.user!.id, id, body);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_CLASSES_READ)
  @Get('classes')
  listClasses(@Req() req: AuthenticatedRequest) {
    return this.academicService.list('class', req.user!.schoolId!);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_CLASSES_MANAGE)
  @Post('classes')
  createClass(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createClassSchema)) body: ClassCreateInput,
  ) {
    return this.academicService.createClass(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_CLASSES_MANAGE)
  @Patch('classes/:id')
  updateClass(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassSchema)) body: ClassUpdateInput,
  ) {
    return this.academicService.updateClass(req.user!.schoolId!, id, body);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_SECTIONS_READ)
  @Get('sections')
  listSections(@Req() req: AuthenticatedRequest) {
    return this.academicService.list('section', req.user!.schoolId!);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_SECTIONS_MANAGE)
  @Post('sections')
  createSection(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createSectionSchema)) body: SectionCreateInput,
  ) {
    return this.academicService.createSection(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_SECTIONS_MANAGE)
  @Patch('sections/:id')
  updateSection(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSectionSchema)) body: SectionUpdateInput,
  ) {
    return this.academicService.updateSection(req.user!.schoolId!, id, body);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_SUBJECTS_READ)
  @Get('subjects')
  listSubjects(@Req() req: AuthenticatedRequest) {
    return this.academicService.list('subject', req.user!.schoolId!);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_SUBJECTS_MANAGE)
  @Post('subjects')
  createSubject(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createSubjectSchema)) body: SubjectCreateInput,
  ) {
    return this.academicService.createSubject(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_SUBJECTS_MANAGE)
  @Patch('subjects/:id')
  updateSubject(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSubjectSchema)) body: SubjectUpdateInput,
  ) {
    return this.academicService.updateSubject(req.user!.schoolId!, id, body);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_SUBJECTS_READ)
  @Get('subject-offerings')
  listSubjectOfferings(@Req() req: AuthenticatedRequest) {
    return this.academicService.listOfferings(req.user!.schoolId!);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_SUBJECTS_READ)
  @Get('subject-offerings/:id')
  getSubjectOffering(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.academicService.getOffering(req.user!.schoolId!, id);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_OFFERINGS_MANAGE)
  @Post('subject-offerings')
  createSubjectOffering(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createSubjectOfferingSchema)) body: SubjectOfferingCreateInput,
  ) {
    return this.academicService.createSubjectOffering(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.ACADEMIC_YEARS_MANAGE)
  @Post('promotions')
  runPromotions(@Req() req: AuthenticatedRequest) {
    return this.academicService.dashboard(req.user!.schoolId!);
  }

  @RequirePermissions(PERMISSIONS.ACADEMIC_DASHBOARD_READ)
  @Get('academic/dashboard')
  dashboard(@Req() req: AuthenticatedRequest) {
    return this.academicService.dashboard(req.user!.schoolId!);
  }
}
