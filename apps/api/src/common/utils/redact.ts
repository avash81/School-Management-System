const SECRET_KEYS = new Set<string>([
  'password',
  'passwordHash',
  'passwordhash',
  'password_hash',
  'oldPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'refreshToken',
  'accessToken',
  'access_token',
  'refresh_token',
  'tokenHash',
  'resetToken',
  'passwordResetToken',
  'secret',
  'apikey',
  'apiKey',
  'api_key',
  'clientSecret',
  'privateKey',
  'jwt',
  'authorization',
  'cookie',
  'set-cookie',
  'session',
  'sessionId',
  'session_id',
  'refreshTokenHash',
]);

const PII_KEYS = new Set<string>([
  'email',
  'phone',
  'mobile',
  'nationalId',
  'aadhaar',
  'ssn',
  'pan',
  'passportNumber',
  'dateOfBirth',
  'dob',
  'address',
  'currentAddress',
  'permanentAddress',
  'guardianPhone',
  'guardianEmail',
]);

const REDACTED = '[REDACTED]';

function shouldMask(key: string): boolean {
  const lower = String(key).toLowerCase().replaceAll('_', '').replaceAll('-', '');
  if (SECRET_KEYS.has(lower) || SECRET_KEYS.has(String(key))) return true;
  if (PII_KEYS.has(key) || PII_KEYS.has(String(key).toLowerCase())) return true;
  for (const secret of SECRET_KEYS) if (lower.includes(secret.toLowerCase())) return true;
  for (const pii of PII_KEYS) if (lower.includes(pii.toLowerCase())) return true;
  return false;
}

export function redactValue<T>(value: T, depth = 0, maxDepth = 8): T {
  if (value == null || depth > maxDepth) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1, maxDepth)) as T;
  if (value instanceof Date || value instanceof RegExp || typeof value === 'function' || typeof (value as unknown as { toISOString?: unknown }).toISOString === 'function') {
    return value;
  }
  const output = {} as Record<string, unknown>;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry == null) {
      output[key] = entry;
      continue;
    }
    if (shouldMask(key)) {
      output[key] = REDACTED;
      continue;
    }
    output[key] = redactValue(entry, depth + 1, maxDepth);
  }
  return output as T;
}
