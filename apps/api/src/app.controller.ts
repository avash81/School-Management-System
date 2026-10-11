import { Controller, Get } from '@nestjs/common';
import { prisma } from '@schoolos/database';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      data: { service: 'api', status: 'ok', uptime: process.uptime() },
      meta: {},
    };
  }

  @Get('readiness')
  async readiness() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { data: { service: 'api', status: 'ready', database: 'ready' }, meta: {} };
    } catch {
      return { data: { service: 'api', status: 'not_ready', database: 'unavailable' }, meta: {} };
    }
  }
}
