import { Body, Controller, Delete, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '@schoolos/validation';
import type { Request, Response } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuthService, getSessionCookieName, sessionCookieOptions } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthenticationGuard } from './authentication.guard.js';
import { RequirePermissions } from './permission.decorator.js';
import { PermissionGuard } from './permission.guard.js';
import { PERMISSIONS } from './permissions.catalog.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Throttle({ 'auth-public': { limit: 20, ttl: 15 * 60_000 } })
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: { email: string; password: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(input.email, input.password, { ip: req.ip, userAgent: req.get('user-agent') });
    res.cookie(getSessionCookieName(), result.secret, sessionCookieOptions());
    return { data: this.publicUser(result.user) };
  }

  @UseGuards(AuthenticationGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_SESSIONS_MANAGE)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.[getSessionCookieName()] ?? '';
    await this.authService.revoke(cookie, req.user?.id);
    res.clearCookie(getSessionCookieName(), { path: '/' });
    return { data: { success: true } };
  }

  @UseGuards(AuthenticationGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_SESSIONS_MANAGE)
  @Post('logout-all')
  async logoutAll(@Req() req: AuthenticatedRequest) {
    await this.authService.revokeAll(req.user!.id, req.user!.sessionId);
    return { data: { success: true } };
  }

  @UseGuards(AuthenticationGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return { data: this.publicUser(req.user!) };
  }

  @UseGuards(AuthenticationGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_SESSIONS_MANAGE)
  @Get('sessions')
  async listSessions(@Req() req: AuthenticatedRequest) {
    return { data: await this.authService.sessions(req.user!.id) };
  }

  @UseGuards(AuthenticationGuard, PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_SESSIONS_MANAGE)
  @Delete('sessions/:id')
  async revokeSession(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.authService.revokeSession(req.user!.id, id);
    return { data: { success: true } };
  }

  @Throttle({ 'auth-public': { limit: 10, ttl: 15 * 60_000 } })
  @Post('forgot-password')
  async forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) input: { email: string }) {
    await this.authService.requestPasswordReset(input.email);
    return { data: { message: 'If an account exists, password reset instructions will be sent.' } };
  }

  @Throttle({ 'auth-public': { limit: 10, ttl: 15 * 60_000 } })
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) input: { token: string; password: string }) {
    await this.authService.resetPassword(input.token, input.password);
    return { data: { success: true } };
  }

  private publicUser(user: NonNullable<AuthenticatedRequest['user']>) {
    return { id: user.id, name: `${user.firstName} ${user.lastName}`.trim(), email: user.email, schoolId: user.schoolId, roles: user.roles, permissions: user.permissions };
  }
}
