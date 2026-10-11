import { execFileSync, execSync } from 'node:child_process';

function getWindowsPids() {
  const command = [
    "$items = Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and ($_.CommandLine -match 'next dev' -or $_.CommandLine -match 'tsx watch src/main.ts' -or $_.CommandLine -match 'tsx watch src/index.ts') };",
    '$items | Select-Object -ExpandProperty ProcessId',
  ].join(' ');
  const output = execFileSync('powershell', ['-NoLogo', '-NoProfile', '-Command', command], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const pids = output
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  return [...new Set(pids)];
}

function stopPids(pids) {
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
      console.log(`Stopped local process ${pid}`);
    } catch {
      // ignore already-exited processes
    }
  }
}

function main() {
  if (process.platform !== 'win32') {
    console.log('This stop helper is intended for the local Windows dev workflow.');
    process.exit(0);
  }

  const pids = getWindowsPids();
  if (pids.length === 0) {
    console.log('No local SchoolOS dev processes are running.');
    return;
  }

  stopPids(pids);
  console.log(`Stopped ${pids.length} SchoolOS local dev process(es).`);
}

main();
