import { Module } from '@nestjs/common';

import { TeacherController } from './teacher.controller.js';
import { TeacherService } from './teacher.service.js';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
