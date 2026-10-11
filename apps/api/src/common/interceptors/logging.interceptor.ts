import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { createLogger } from '@schoolos/logger';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { redactValue } from '../utils/redact.js';

const REQUEST_ID_HEADER = 'x-request-id';

const logger = createLogger('api:http');

type HttpContext = {
  requestId: string;
  method: string;
  url: string;
  path: string;
  ip: string;
  schoolId?: string | null;
  userId?: string | null;
  controller?: string;
  handler?: string;
  startedAt: number;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const ctx: HttpContext = {
      requestId: (request.header(REQUEST_ID_HEADER) as string | undefined) ?? String(response.getHeader(REQUEST_ID_HEADER) ?? ''),
      method: request.method,
      url: request.originalUrl || request.url,
      path: request.path,
      ip: (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? request.socket.remoteAddress ?? request.ip ?? 'unknown',
      startedAt,
    };

    if (context.getType() === 'http') {
      const handlerRef = context.getHandler();
      const classRef = context.getClass();
      ctx.handler = typeof handlerRef === 'function' ? handlerRef.name : undefined;
      ctx.controller = typeof classRef === 'function' ? classRef.name : undefined;
    }

    if ((request as unknown as { user?: { schoolId?: string | null; id?: string | null } }).user) {
      ctx.schoolId = (request as unknown as { user: { schoolId?: string | null; id?: string | null } }).user.schoolId ?? null;
      ctx.userId = (request as unknown as { user: { schoolId?: string | null; id?: string | null } }).user.id ?? null;
    }

    const safeQuery = redactValue(request.query ?? {});
    const safeParams = redactValue(request.params ?? {});
    const safeBody = request.body && typeof request.body === 'object' ? redactValue(request.body as Record<string, unknown>) : undefined;
    const safeHeaders = redactValue(request.headers ?? {});

    logger.debug({
      ...ctx,
      event: 'http.request',
      headers: safeHeaders,
      query: safeQuery,
      params: safeParams,
      body: safeBody,
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startedAt;
        const status = response.statusCode;
        if (status >= 500) logger.error({ ...ctx, event: 'http.response', status, durationMs: duration });
        else if (status >= 400) logger.warn({ ...ctx, event: 'http.response', status, durationMs: duration });
        else logger.info({ ...ctx, event: 'http.response', status, durationMs: duration, responseSize: responseDataSize(data) });
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startedAt;
        const status = response.statusCode >= 400 ? response.statusCode : 500;
        logger.error({ ...ctx, event: 'http.error', status, durationMs: duration, errorName: error?.name, errorMessage: error?.message ?? String(error) });
        return throwError(() => error);
      }),
      finalize(() => {
        if (!response.headersSent) {
          const duration = Date.now() - startedAt;
          logger.debug({ ...ctx, event: 'http.finalized', status: response.statusCode, durationMs: duration });
        }
      }),
    );
  }
}

function responseDataSize(data: unknown): number | undefined {
  if (data == null) return undefined;
  if (typeof data === 'string') return data.length;
  if (typeof data === 'number' || typeof data === 'boolean') return String(data).length;
  if (typeof data === 'object' && data !== null && typeof (data as { byteLength?: unknown }).byteLength === 'number') return (data as { byteLength: number }).byteLength;
  try {
    return JSON.stringify(data).length;
  } catch {
    return undefined;
  }
}
