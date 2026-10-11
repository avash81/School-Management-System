import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from './auth.types.js';
import { REQUIRED_PERMISSIONS } from './permission.decorator.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]) ?? [];
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user || required.some((permission) => !user.permissions.includes(permission))) throw new ForbiddenException('You do not have permission to perform this action.');
    return true;
  }
}
