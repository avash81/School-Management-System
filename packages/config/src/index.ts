import { existsSync } from 'node:fs';
import path from 'node:path';

import { type Environment, environmentSchema } from '@schoolos/validation';
import * as dotenv from 'dotenv';

function findEnvFile(startDir: string): string | undefined {
  let currentDir = startDir;

  while (true) {
    for (const candidate of ['.env.local', '.env']) {
      const filePath = path.join(currentDir, candidate);
      if (existsSync(filePath)) {
        return filePath;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return undefined;
    }
    currentDir = parentDir;
  }
}

export function loadEnvironment(
  source: Record<string, string | undefined> = process.env,
): Environment {
  if (source === process.env) {
    const envFile = findEnvFile(process.cwd());
    if (envFile) {
      dotenv.config({ path: envFile });
    }
  }

  return environmentSchema.parse(source);
}

export function getRequiredEnv(source: Record<string, string | undefined>, key: string): string {
  const value = source[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
