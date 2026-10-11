import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { REQUEST_ID_HEADER } from '../interceptors/request-id.interceptor.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = request.header(REQUEST_ID_HEADER) ?? String(request.headers[REQUEST_ID_HEADER] ?? 'unknown');
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? String(exceptionResponse.message)
          : 'An unexpected error occurred.';

    response.status(status).json({
      error: {
        code: `HTTP_${status}`,
        message,
        requestId,
      },
    });
  }
}
