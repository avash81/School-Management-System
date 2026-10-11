import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { PERMISSIONS, RequirePermissions } from '../auth/index.js';
import { PermissionGuard } from '../auth/permission.guard.js';
import { SchoolContextGuard } from '../auth/school-context.guard.js';
import { ExamService } from './exam.service.js';

@Controller()
@UseGuards(AuthenticationGuard, SchoolContextGuard, PermissionGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @RequirePermissions(PERMISSIONS.EXAMS_READ)
  @Get('exams')
  list(@Req() req: AuthenticatedRequest) { return this.examService.listExams(req.user!.schoolId!); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.EXAMS_MANAGE)
  @Post('exams')
  createExam(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.examService.createExam(req.user!.schoolId!, req.user!.id, body);
  }

  @RequirePermissions(PERMISSIONS.EXAMS_READ)
  @Get('exams/:id')
  getExam(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.examService.findExam(req.user!.schoolId!, id); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.EXAMS_MANAGE)
  @Patch('exams/:id')
  updateExam(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.examService.updateExam(req.user!.schoolId!, req.user!.id, id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.EXAMS_MANAGE)
  @Post('exams/:id/subjects')
  addSubject(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.examService.addSubject(req.user!.schoolId!, req.user!.id, id, body);
  }

  @RequirePermissions(PERMISSIONS.EXAMS_READ)
  @Get('blueprints')
  listBlueprints(@Req() req: AuthenticatedRequest) { return this.examService.listBlueprints(req.user!.schoolId!); }

  @RequirePermissions(PERMISSIONS.EXAMS_READ)
  @Get('blueprints/:id')
  getBlueprint(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.examService.getBlueprint(req.user!.schoolId!, id); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.EXAMS_MANAGE)
  @Post('blueprints')
  createBlueprint(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.examService.createBlueprint(req.user!.schoolId!, req.user!.id, body);
  }

  @RequirePermissions(PERMISSIONS.EXAMS_READ)
  @Get('blueprints/:id/components')
  listBlueprintComponents(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.examService.listBlueprintComponents(req.user!.schoolId!, id);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.EXAMS_MANAGE)
  @Post('blueprints/:id/components')
  createBlueprintComponent(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.examService.createBlueprintComponent(req.user!.schoolId!, req.user!.id, id, body);
  }

  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  @Get('grading-bands')
  listGradingBands(@Req() req: AuthenticatedRequest) { return this.examService.listGradingBands(req.user!.schoolId!); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_CALCULATE)
  @Post('grading-bands')
  upsertGradingBand(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.examService.upsertGradingBand(req.user!.schoolId!, req.user!.id, body);
  }

  @RequirePermissions(PERMISSIONS.MARKS_READ)
  @Get('marks')
  listMarks(@Req() req: AuthenticatedRequest) { return this.examService.listMarks(req.user!.schoolId!); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_WRITE)
  @Post('marks')
  enterMarks(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) {
    return this.examService.enterMarks(req.user!.schoolId!, req.user!.id, body);
  }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_SUBMIT)
  @Post('marks/submit')
  submitMarks(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.examService.transitionMarks(req.user!.schoolId!, req.user!.id, body, 'pending'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_VERIFY)
  @Post('marks/verify')
  verifyMarks(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.examService.transitionMarks(req.user!.schoolId!, req.user!.id, body, 'verified'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_APPROVE)
  @Post('marks/approve')
  approveMarks(@Req() req: AuthenticatedRequest, @Body() body: Record<string, unknown>) { return this.examService.transitionMarks(req.user!.schoolId!, req.user!.id, body, 'approved'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_IMPORT)
  @Post('mark-imports')
  importMarks(@Req() req: AuthenticatedRequest, @Body() body: { rows?: unknown[] }) { return this.examService.importPreview(req.user!.schoolId!, req.user!.id, body.rows ?? []); }

  @RequirePermissions(PERMISSIONS.MARKS_IMPORT)
  @Get('mark-imports/:jobId')
  importStatus(@Req() req: AuthenticatedRequest, @Param('jobId') jobId: string) { return this.examService.importStatus(req.user!.schoolId!, jobId); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.MARKS_IMPORT, PERMISSIONS.MARKS_WRITE)
  @Post('mark-imports/:jobId/confirm')
  confirmImport(@Req() req: AuthenticatedRequest, @Param('jobId') jobId: string) { return this.examService.confirmImport(req.user!.schoolId!, req.user!.id, jobId); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_CALCULATE)
  @Post('results/calculate')
  calculateResults(@Req() req: AuthenticatedRequest, @Body() body: { examId: string }) { return this.examService.calculateResults(req.user!.schoolId!, req.user!.id, body.examId); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_APPROVE)
  @Post('results/verify')
  verifyResults(@Req() req: AuthenticatedRequest, @Body() body: { examId: string }) { return this.examService.transitionResults(req.user!.schoolId!, req.user!.id, body.examId, 'verified'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_APPROVE)
  @Post('results/approve')
  approveResults(@Req() req: AuthenticatedRequest, @Body() body: { examId: string }) { return this.examService.transitionResults(req.user!.schoolId!, req.user!.id, body.examId, 'approved'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_PUBLISH)
  @Post('results/publish')
  publishResults(@Req() req: AuthenticatedRequest, @Body() body: { examId: string }) { return this.examService.transitionResults(req.user!.schoolId!, req.user!.id, body.examId, 'published'); }

  @Throttle({ mutations: { limit: 100, ttl: 60_000 } })
  @RequirePermissions(PERMISSIONS.RESULTS_REOPEN)
  @Post('results/reopen')
  reopenResults(@Req() req: AuthenticatedRequest, @Body() body: { examId: string; reason?: string }) { return this.examService.transitionResults(req.user!.schoolId!, req.user!.id, body.examId, 'reopened', body.reason); }

  @RequirePermissions(PERMISSIONS.RESULTS_READ)
  @Get('results/:studentId')
  getStudentResult(@Req() req: AuthenticatedRequest, @Param('studentId') studentId: string) { return this.examService.studentResult(req.user!.schoolId!, studentId); }
}
