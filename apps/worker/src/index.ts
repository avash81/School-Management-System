import { loadEnvironment } from '@schoolos/config';
import { Queue, Worker } from 'bullmq';

loadEnvironment(process.env);

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  password: redisUrl.password || undefined,
  db: redisUrl.pathname && redisUrl.pathname !== '/' ? Number(redisUrl.pathname.slice(1)) : undefined,
};

const queue = new Queue('schoolos-jobs', { connection });

new Worker(
  'schoolos-jobs',
  async (job: { name: string }) => {
    return {
      processed: true,
      jobName: job.name,
    };
  },
  { connection },
);

async function bootstrap() {
  try {
    await queue.add('startup-heartbeat', { startedAt: new Date().toISOString() });
    process.stdout.write('SchoolOS worker is ready\n');
  } catch (error) {
    process.stderr.write(`SchoolOS worker failed to start: ${String(error)}\n`);
    process.exitCode = 1;
  }
}

void bootstrap();
