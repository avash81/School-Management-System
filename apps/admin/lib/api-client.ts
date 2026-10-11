const DEFAULT_API_BASE = `http://localhost:${process.env.NEXT_PUBLIC_API_PORT ?? process.env.API_PORT ?? '4000'}/api/v1`;

export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE;
  return `${base.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export const API_BASE = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE;
  if (env && env.trim().length > 0) return env.replace(/\/+$/, '');
  return DEFAULT_API_BASE;
})();

type FetchInit = Parameters<typeof fetch>[1];

export interface RequestOptions extends Omit<NonNullable<FetchInit>, 'credentials' | 'headers'> {
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly fields?: Record<string, unknown>;
  constructor(status: number, message: string, code?: string, fields?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });
  const contentType = response.headers.get('content-type');
  let payload: unknown = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }
  if (!response.ok) {
    const errorPayload = payload as { error?: { code?: string; message?: string; fields?: Record<string, unknown> } } | null;
    const message = errorPayload?.error?.message ?? (response.statusText || `Request failed with status ${response.status}`);
    throw new ApiError(response.status, message, errorPayload?.error?.code, errorPayload?.error?.fields);
  }
  return payload as T;
}

export async function apiFetchAll<T extends unknown[]>(requests: Array<[string, RequestOptions?]>): Promise<T> {
  return Promise.all(requests.map(([path, options]) => apiFetch(path, options))) as Promise<T>;
}
