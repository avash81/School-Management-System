import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

async function isPortFree(port) {
  const hosts = ['127.0.0.1', '::1', '0.0.0.0', '::'];

  for (const host of hosts) {
    const isFree = await new Promise((resolve) => {
      const server = net.createServer();
      server.unref();

      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });

      server.listen({ port, host });
    });

    if (!isFree) {
      return false;
    }
  }

  return true;
}

async function findFreePort(preferredPort) {
  let port = Number(preferredPort || 3000);

  while (port <= 65535) {
    if (await isPortFree(port)) {
      return port;
    }
    port += 1;
  }

  throw new Error(`No free port available starting from ${preferredPort}`);
}

function withPortFlag(args, chosenPort) {
  const nextArgs = [...args];
  const portFlagIndex = nextArgs.findIndex((item) => item === '--port' || item === '-p');

  if (portFlagIndex >= 0) {
    nextArgs[portFlagIndex + 1] = String(chosenPort);
    return nextArgs;
  }

  return [...nextArgs, '--port', String(chosenPort)];
}

async function main() {
  const [portEnvName, preferredPortValue, ...commandParts] = process.argv.slice(2);
  if (!portEnvName || !commandParts.length) {
    console.error('Usage: node run-local-app.mjs <PORT_ENV> <preferredPort> <command> [args...]');
    process.exit(1);
  }

  const preferredPort = Number(preferredPortValue || 3000);
  const chosenPort = await findFreePort(preferredPort);
  const command = commandParts[0];
  const commandArgs = commandParts.slice(1);

  const finalArgs = command === 'next' ? withPortFlag(commandArgs, chosenPort) : commandArgs;

  const childEnv = {
    ...process.env,
    [portEnvName]: String(chosenPort),
  };

  if (command === 'next') {
    const nextDir = path.resolve(process.cwd(), '.next');

    if (process.platform === 'win32') {
      const safeNextDir = nextDir.replace(/'/g, "''");
      spawnSync(
        'powershell',
        ['-NoLogo', '-NoProfile', '-Command', `if (Test-Path -LiteralPath '${safeNextDir}') { Remove-Item -Recurse -Force -LiteralPath '${safeNextDir}' -ErrorAction SilentlyContinue }`],
        { stdio: 'inherit' },
      );
    } else {
      spawnSync('rm', ['-rf', nextDir], { stdio: 'inherit' });
    }

    childEnv.PORT = String(chosenPort);
    if (!childEnv.NEXT_PUBLIC_API_BASE && childEnv.API_PORT) {
      childEnv.NEXT_PUBLIC_API_BASE = `http://localhost:${childEnv.API_PORT}/api/v1`;
    }
  }

  console.log(`[local-dev] ${portEnvName}=${chosenPort} -> ${command} ${finalArgs.join(' ')}`);

  const child = spawn(command, finalArgs, {
    stdio: 'inherit',
    env: childEnv,
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

void main();
