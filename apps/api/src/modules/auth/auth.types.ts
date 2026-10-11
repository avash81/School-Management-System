import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolId: string | null;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };
