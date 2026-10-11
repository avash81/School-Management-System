import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { describe, expect, it } from 'vitest';

import type { AuthenticatedUser } from './auth.types.js';
import { SchoolContextGuard } from './school-context.guard.js';

describe('SchoolContextGuard', () => {
  const guard = new SchoolContextGuard();
  const controller = class {};
  const handler = () => undefined;

  function makeContext(user: AuthenticatedUser | undefined): ExecutionContext {
    return new ExecutionContextHost([{ user }], controller, handler);
  }

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.test',
    firstName: 'School',
    lastName: 'Admin',
    schoolId: 'school-1',
    roles: ['school_admin'],
    permissions: [],
    sessionId: 'session-1',
  };

  it('rejects missing authentication', () => {
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(UnauthorizedException);
  });

  it.each([null, '', '   '])('rejects an absent school context (%s)', (schoolId) => {
    const userWithoutSchool = { ...user, schoolId };

    expect(() => guard.canActivate(makeContext(userWithoutSchool))).toThrow(ForbiddenException);
  });

  it('allows a user with a school context', () => {
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });
});
