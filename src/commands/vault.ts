import type { Command } from 'commander';
import { execSync } from 'child_process';

export function registerVault(program: Command): void {
  const vault = program
    .command('vault')
    .description('Manage Oracle knowledge vault (delegates to arra-oracle)')
    .enablePositionalOptions()
    .passThroughOptions();

  vault
    .command('init <repo>')
    .description('Initialize vault with a GitHub repo (owner/repo)')
    .option('--json', 'Output raw JSON')
    .action(async (repo, opts) => {
      runVaultCommand(`init ${repo}`, opts);
    });

  vault
    .command('sync')
    .description('Commit + push vault repo to GitHub (backup)')
    .option('--dry-run', 'Preview what would be committed')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const args = opts.dryRun ? 'sync --dry-run' : 'sync';
      runVaultCommand(args, opts);
    });

  vault
    .command('pull')
    .description('Pull vault files into the local psi directory')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      runVaultCommand('pull', opts);
    });

  vault
    .command('status')
    .description('Show vault configuration and pending changes')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      runVaultCommand('status', opts);
    });

  vault
    .command('migrate')
    .description('Seed vault repo from all ghq repos with psi directories')
    .option('--dry-run', 'Preview what would be copied')
    .option('--list', 'List repos with psi directories')
    .option('--symlink', 'Replace local psi with symlink to vault')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const args = ['migrate'];
      if (opts.dryRun) args.push('--dry-run');
      if (opts.list) args.push('--list');
      if (opts.symlink) args.push('--symlink');
      runVaultCommand(args.join(' '), opts);
    });

  // Default action: status
  vault.action(async (opts) => {
    runVaultCommand('status', opts);
  }).option('--json', 'Output raw JSON');
}

function runVaultCommand(subcommand: string, opts: any): void {
  try {
    execSync(`bunx arra-oracle vault ${subcommand}`, {
      stdio: opts.json ? 'pipe' : 'inherit',
      env: process.env as Record<string, string>,
    });
  } catch (err: any) {
    if (err.status) process.exit(err.status);
    throw err;
  }
}
