/*
 * @schoolos/auth — FUTURE USE PACKAGE
 * ------------------------------------------------------------------
 * Status: Reserved for future JWT Bearer authentication support.
 * Current MVP authentication strategy: Session cookie only
 *   (see apps/api/src/modules/auth/* — AuthenticationGuard,
 *    PermissionGuard, loginSchema + ZodValidationPipe).
 *
 * Planned activation: When mobile/third-party API clients require
 * Bearer-token auth in addition to the cookie-based Admin/Portal UI.
 * Activation checklist:
 *   1. Product/tech owner confirms mobile MVP target date.
 *   2. Register JWT AuthStrategy in parallel with session strategy.
 *   3. Add token revocation (jti + Redis blocklist or DB token table).
 *   4. Rotate JWT_SECRET with documented key-rotation SOP (HI-03 §D4).
 *   5. Tenancy binding: JWT claims must include schoolId + scope check.
 *   6. Audit: every token issuance/validation written to audit_logs.
 *
 * Until activated: imports of @schoolos/auth are intentionally unused.
 * No dead code removal — package is reserved per Document 29 §87
 * (auth-strategy extensibility decision).
 * ------------------------------------------------------------------
 */

import { getRequiredEnv } from '@schoolos/config';
import { jwtVerify, SignJWT } from 'jose';

export interface AuthTokenPayload {
  readonly sub: string;
  readonly role: string;
}

export async function signAccessToken(payload: AuthTokenPayload, secret = process.env.JWT_SECRET): Promise<string> {
  const jwtSecret = new TextEncoder().encode(getRequiredEnv({ JWT_SECRET: secret }, 'JWT_SECRET'));

  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(jwtSecret);
}

export async function verifyAccessToken(token: string, secret = process.env.JWT_SECRET): Promise<AuthTokenPayload> {
  const jwtSecret = new TextEncoder().encode(getRequiredEnv({ JWT_SECRET: secret }, 'JWT_SECRET'));
  const result = await jwtVerify(token, jwtSecret);

  return {
    sub: result.payload.sub ?? '',
    role: String(result.payload.role ?? ''),
  };
}

export const AUTH_PACKAGE_STATUS = 'FUTURE_RESERVED' as const;
export const AUTH_CURRENT_STRATEGY = 'SESSION_COOKIE_ONLY' as const;

