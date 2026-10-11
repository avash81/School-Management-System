import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class SchoolContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) throw new UnauthorizedException('Authentication required.');
    if (typeof user.schoolId !== 'string' || user.schoolId.trim().length === 0) {
      throw new ForbiddenException('A school context is required.');
    }
    return true;
  }
}
