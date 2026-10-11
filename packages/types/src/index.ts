export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

export type Id = Brand<string, 'Id'>;

export interface Timestamped {
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ApiStatus = 'ok' | 'degraded' | 'error';

export interface HealthResponse {
  readonly status: ApiStatus;
  readonly service: string;
  readonly uptime: number;
}
