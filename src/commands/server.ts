import type { Command } from 'commander';
import { printJson } from '../format.ts';

const PORT = process.env.ORACLE_PORT || '47778';
const BASE_URL = process.env.ORACLE_URL || `http://localhost:${PORT}`;

export function registerServer(program: Command): void {
  const srv = program
    .command('server')
    .description('Manage Oracle HTTP server')
    .enablePositionalOptions()
    .passThroughOptions();

  srv
    .command('start')
    .description('Start the Oracle server (via oracle-v2)')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      // Check if already running
      try {
        const health = await fetch(`${BASE_URL}/api/health`);
        if (health.ok) {
          if (opts.json) return printJson({ started: true, already_running: true, url: BASE_URL });
          console.log(`Oracle server already running at ${BASE_URL}.`);
          return;
        }
      } catch {
        // Not running, proceed to start
      }

      // Spawn oracle-v2 server detached
      const proc = Bun.spawn(['bunx', 'oracle-v2', '--server'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        env: { ...process.env, ORACLE_PORT: PORT },
      });
      proc.unref();

      // Wait for server to come up (max 15s)
      const deadline = Date.now() + 15000;
      let started = false;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 500));
        try {
          const res = await fetch(`${BASE_URL}/api/health`);
          if (res.ok) { started = true; break; }
        } catch {
          // Not ready yet
        }
      }

      if (opts.json) return printJson({ started, url: BASE_URL });
      if (started) {
        console.log(`Oracle server started at ${BASE_URL}.`);
      } else {
        console.error('Failed to start Oracle server.');
        process.exit(1);
      }
    });

  srv
    .command('stop')
    .description('Stop the Oracle server')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      try {
        await fetch(`${BASE_URL}/api/shutdown`, { method: 'POST' });
      } catch {
        if (opts.json) return printJson({ stopped: true, was_running: false });
        console.log('Oracle server is not running.');
        return;
      }

      // Wait for port to free (max 5s)
      const deadline = Date.now() + 5000;
      let stopped = false;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 300));
        try {
          await fetch(`${BASE_URL}/api/health`);
        } catch {
          stopped = true;
          break;
        }
      }

      if (opts.json) return printJson({ stopped });
      if (stopped) {
        console.log('Oracle server stopped.');
      } else {
        console.error(`Server may still be running at ${BASE_URL}.`);
        process.exit(1);
      }
    });

  srv
    .command('status')
    .description('Show Oracle server status')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      await showStatus(opts);
    });

  // Default action: status
  srv.action(async (opts) => {
    await showStatus(opts);
  }).option('--json', 'Output raw JSON');
}

async function showStatus(opts: any): Promise<void> {
  let running = false;
  let healthy = false;
  let healthData: any = null;

  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    running = true;
    healthy = res.ok;
    if (res.ok) healthData = await res.json();
  } catch {
    // Not running
  }

  const status = {
    running,
    healthy,
    url: BASE_URL,
    ...(healthData || {}),
  };

  if (opts.json) return printJson(status);
  console.log(`Running:  ${running ? 'yes' : 'no'}`);
  console.log(`Healthy:  ${healthy ? 'yes' : 'no'}`);
  console.log(`URL:      ${BASE_URL}`);
}
