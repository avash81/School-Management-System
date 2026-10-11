import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from './auth.types.js';
import { PermissionGuard } from './permission.guard.js';

describe('PermissionGuard', () => {
  const handler = () => undefined;
  const controller = class {};

  function makeGuard(user: AuthenticatedUser | undefined, required: string[] | undefined) {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(required);
    const guard = new PermissionGuard(reflector);
    const context: ExecutionContext = new ExecutionContextHost([{ user }], controller, handler);

    return { guard, context };
  }

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.test',
    firstName: 'School',
    lastName: 'Admin',
    schoolId: 'school-1',
    roles: ['school_admin'],
    permissions: ['academic.years.read', 'academic.classes.read'],
    sessionId: 'session-1',
  };

  it('denies requests without an authenticated user', () => {
    const { guard, context } = makeGuard(undefined, []);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies when any required permission is missing', () => {
    const { guard, context } = makeGuard(user, ['academic.years.read', 'academic.classes.manage']);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows a user with every required permission', () => {
    const { guard, context } = makeGuard(user, ['academic.years.read', 'academic.classes.read']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows authenticated requests when no permission metadata is defined', () => {
    const { guard, context } = makeGuard(user, undefined);

    expect(guard.canActivate(context)).toBe(true);
  });
});
