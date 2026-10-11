import { Global, Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthenticationGuard } from './authentication.guard.js';
import { PermissionGuard } from './permission.guard.js';
import { SchoolContextGuard } from './school-context.guard.js';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard, PermissionGuard, SchoolContextGuard],
  exports: [AuthService, AuthenticationGuard, PermissionGuard, SchoolContextGuard],
})
export class AuthModule {}
