import 'reflect-metadata';

import { setTimeout as delay } from 'node:timers/promises';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadEnvironment } from '@schoolos/config';
import { prisma } from '@schoolos/database';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor.js';

async function waitForDatabase(maxTotalMs = 10_000, baseDelayMs = 100): Promise<void> {
  const startedAt = Date.now();
  let attempt = 0;
  while (Date.now() - startedAt < maxTotalMs) {
    attempt += 1;
    try {
      await prisma.$queryRawUnsafe('SELECT 1 AS ready');
      process.stdout.write(`[bootstrap] Database reachable on attempt ${attempt}\n`);
      return;
    } catch {
      const elapsed = Date.now() - startedAt;
      const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), 1500, maxTotalMs - elapsed);
      if (delayMs <= 0) break;
      process.stdout.write(`[bootstrap] Database not ready (attempt ${attempt}, elapsed ${elapsed}ms); waiting ${delayMs}ms\n`);
      await delay(delayMs);
    }
  }
  process.stdout.write(`[bootstrap] ERROR: Database unreachable after ${Date.now() - startedAt}ms; aborting startup\n`);
  process.exit(1);
}

async function bootstrap() {
  loadEnvironment(process.env);
  await waitForDatabase();

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002').split(',').map((origin) => origin.trim()).filter(Boolean);
  const app = await NestFactory.create(AppModule, { cors: { origin: allowedOrigins, credentials: true } });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidUnknownValues: true }));
  app.use((_request: unknown, response: { setHeader: (name: string, value: string) => void }, next: () => void) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SchoolOS API')
    .setDescription('SchoolOS modular school operations API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  process.stdout.write(`SchoolOS API listening on :${port}\n`);
}

void bootstrap();
