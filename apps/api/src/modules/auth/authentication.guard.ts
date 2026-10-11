import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService, getSessionCookieName } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookie = request.cookies?.[getSessionCookieName()] ?? request.signedCookies?.[getSessionCookieName()];
    if (!cookie || typeof cookie !== 'string') throw new UnauthorizedException('Authentication required.');
    request.user = await this.authService.authenticate(cookie);
    return true;
  }
}
