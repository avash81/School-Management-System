import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor.js';
import { AcademicModule } from './modules/academic/academic.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { DocumentModule } from './modules/document/document.module.js';
import { ExamModule } from './modules/exam/exam.module.js';
import { NoticeModule } from './modules/notice/notice.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { ResultModule } from './modules/result/result.module.js';
import { SchoolModule } from './modules/school/school.module.js';
import { StudentModule } from './modules/student/student.module.js';
import { TeacherModule } from './modules/teacher/teacher.module.js';

function buildThrottlerImports() {
  const redisUrl = process.env.REDIS_URL;
  const storage = redisUrl ? { storage: new ThrottlerStorageRedisService(redisUrl) } : {};
  return [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 200, ...storage },
      { name: 'auth-public', ttl: 15 * 60_000, limit: 20, ...storage },
      { name: 'mutations', ttl: 60_000, limit: 100, ...storage },
      { name: 'reads', ttl: 60_000, limit: 200, ...storage },
    ]),
  ];
}

@Module({
  controllers: [AppController],
  imports: [...buildThrottlerImports(), AuthModule, SchoolModule, StudentModule, TeacherModule, AcademicModule, ExamModule, ResultModule, AiModule, DocumentModule, DashboardModule, NoticeModule, ReportsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
