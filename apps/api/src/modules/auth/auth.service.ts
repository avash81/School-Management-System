import { createHash, randomBytes } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { prisma } from '@schoolos/database';
import { UAParser } from 'ua-parser-js';

import type { AuthenticatedUser } from './auth.types.js';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'schoolos_session';
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 30);
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.SESSION_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
    path: '/',
    maxAge: SESSION_TTL_MS,
  };
}

function summarizeDevice(userAgent?: string): string | null {
  if (!userAgent) return null;
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  const parts: string[] = [];
  if (browser?.name) parts.push(`${browser.name}${browser.major ? ` ${browser.major}` : ''}`);
  if (os?.name) parts.push(`${os.name}${os.version ? ` ${os.version}` : ''}`);
  if (device?.model || device?.vendor) parts.push([device.vendor, device.model].filter(Boolean).join(' '));
  return parts.length > 0 ? parts.join(' · ') : userAgent.slice(0, 64);
}

@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();

  async login(email: string, password: string, metadata: { ip?: string; userAgent?: string }) {
    const normalizedEmail = email.toLowerCase();
    this.enforceRateLimit(metadata.ip ?? 'unknown', normalizedEmail);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail, deletedAt: null } });

    if (!user || user.status !== 'active' || !(await verify(user.passwordHash, password))) {
      this.recordFailure(metadata.ip ?? 'unknown', normalizedEmail);
      await this.audit(user?.id, user?.schoolId, 'LOGIN_FAILED', 'Authentication failed', metadata);
      throw new UnauthorizedException('Invalid email or password.');
    }

    this.attempts.delete(this.key(metadata.ip ?? 'unknown', normalizedEmail));
    const rawSecret = randomBytes(32).toString('base64url');
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashSecret(rawSecret),
        device: summarizeDevice(metadata.userAgent),
        browser: metadata.userAgent ?? null,
        ipAddress: metadata.ip ?? null,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit(user.id, user.schoolId, 'LOGIN_SUCCESS', 'User signed in', metadata);
    return { sessionId: session.id, secret: rawSecret, user: await this.userContext(user.id, session.id) };
  }

  async userContext(userId: string, sessionId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'active') throw new UnauthorizedException('Authentication required.');
    const userRoles = await prisma.userRole.findMany({ where: { userId, deletedAt: null } });
    const roleIds = userRoles.map((ur) => ur.roleId);
    const roles = roleIds.length > 0 ? await prisma.role.findMany({ where: { id: { in: roleIds }, deletedAt: null } }) : [];
    const resolvedRoleIds = roles.map((r) => r.id);
    const rolePermissions = resolvedRoleIds.length > 0 ? await prisma.rolePermission.findMany({ where: { roleId: { in: resolvedRoleIds }, deletedAt: null } }) : [];
    const permissionIds = rolePermissions.map((rp) => rp.permissionId);
    const permissions = permissionIds.length > 0 ? await prisma.permission.findMany({ where: { id: { in: permissionIds }, deletedAt: null } }) : [];
    const permissionById = new Map(permissions.map((p) => [p.id, p.code]));
    const permissionsByRole = new Map<string, string[]>();
    for (const rp of rolePermissions) {
      const code = permissionById.get(rp.permissionId);
      if (!code) continue;
      const list = permissionsByRole.get(rp.roleId);
      if (list) list.push(code);
      else permissionsByRole.set(rp.roleId, [code]);
    }
    const roleByRoleId = new Map(roles.map((r) => [r.id, r.code]));
    const finalRoles: string[] = [];
    const finalPermissions: string[] = [];
    for (const ur of userRoles) {
      const roleCode = roleByRoleId.get(ur.roleId);
      if (roleCode) finalRoles.push(roleCode);
      const perms = permissionsByRole.get(ur.roleId);
      if (perms) finalPermissions.push(...perms);
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
      roles: Array.from(new Set(finalRoles)),
      permissions: Array.from(new Set(finalPermissions)),
      sessionId,
    };
  }

  async authenticate(secret: string) {
    const session = await prisma.session.findFirst({ where: { refreshTokenHash: hashSecret(secret), revokedAt: null } });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('Authentication required.');
    return this.userContext(session.userId, session.id);
  }

  async revoke(secret: string, userId?: string) {
    const session = await prisma.session.findFirst({ where: { refreshTokenHash: hashSecret(secret), revokedAt: null } });
    if (session && (!userId || session.userId === userId)) {
      await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      await this.audit(session.userId, null, 'LOGOUT', 'Session revoked');
    }
  }

  async revokeAll(userId: string, exceptSessionId?: string) {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
      data: { revokedAt: new Date() },
    });
    await this.audit(userId, null, 'SESSION_REVOKED', 'Sessions revoked');
  }

  async sessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, device: true, browser: true, ipAddress: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await prisma.session.updateMany({ where: { id: sessionId, userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit(userId, null, 'SESSION_REVOKED', 'A session was revoked');
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase(), deletedAt: null } });
    if (!user) return;
    const rawToken = randomBytes(32).toString('base64url');
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashSecret(rawToken), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });
    await this.audit(user.id, user.schoolId, 'PASSWORD_RESET_REQUESTED', 'Password reset requested');
  }

  async resetPassword(token: string, password: string) {
    const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashSecret(token) } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new UnauthorizedException('Invalid or expired reset token.');
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hash(password) } }),
      prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.audit(reset.userId, null, 'PASSWORD_RESET', 'Password reset completed');
  }

  private enforceRateLimit(ip: string, email: string) {
    const attempt = this.attempts.get(this.key(ip, email));
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10)) {
      throw new UnauthorizedException('Too many attempts. Try again later.');
    }
  }

  private recordFailure(ip: string, email: string) {
    const key = this.key(ip, email);
    const current = this.attempts.get(key);
    const resetAt = current?.resetAt && current.resetAt > Date.now() ? current.resetAt : Date.now() + 15 * 60 * 1000;
    this.attempts.set(key, { count: (current?.count ?? 0) + 1, resetAt });
  }

  private key(ip: string, email: string) {
    return `${ip}:${email}`;
  }

  private async audit(userId: string | undefined, schoolId: string | null | undefined, action: string, message: string, metadata?: object) {
    await prisma.auditLog.create({ data: { userId, schoolId: schoolId ?? null, module: 'AUTH', action, message, metadata } });
  }
}
