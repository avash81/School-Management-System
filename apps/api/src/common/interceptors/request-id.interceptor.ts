import { randomUUID } from 'node:crypto';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = request.header(REQUEST_ID_HEADER) ?? randomUUID();

    response.setHeader(REQUEST_ID_HEADER, requestId);
    request.headers[REQUEST_ID_HEADER] = requestId;

    return next.handle();
  }
}
