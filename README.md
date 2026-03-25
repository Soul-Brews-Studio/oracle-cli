# arra-cli

Command-line interface for [Oracle](https://github.com/Soul-Brews-Studio/arra-oracle) knowledge base.

Pure HTTP client — no server internals, no database access. Talks to the Oracle server over `localhost`.

## Usage

No install needed — run directly from GitHub:

```bash
bunx github:Soul-Brews-Studio/oracle-cli <command>
```

## Prerequisites

Oracle server must be running. Start it with:

```bash
arra server start
```

This spawns `arra-oracle` in the background. You need [arra-oracle](https://github.com/Soul-Brews-Studio/arra-oracle) installed or available via `bunx`.

## Commands

### Knowledge Base

```bash
arra search <query>           # Search (hybrid, fts, or vector)
arra search "patterns" -l 5   # Limit results
arra search "vault" -m fts    # FTS-only mode
arra search "auth" -p myproj  # Filter by project

arra learn -p "lesson text"   # Add a learning
arra learn -p "lesson" -c "tag1,tag2" --origin human

arra list                     # List documents
arra list -t learning -l 20   # Filter by type

arra stats                    # Knowledge base statistics
```

### Threads

```bash
arra threads                  # List threads
arra threads -s open          # Open threads only
arra thread <id>              # View thread + messages
```

### Schedule

```bash
arra schedule                 # List upcoming events
arra schedule list -d 2026-03-05
arra schedule add -d 2026-03-10 -e "Meeting" -t 14:00
```

### Traces & Inbox

```bash
arra traces                   # List discovery traces
arra trace <id>               # View a trace
arra inbox                    # View handoff inbox
```

### Server Management

```bash
arra server status            # Check if running
arra server start             # Start arra-oracle server
arra server stop              # Graceful HTTP shutdown
```

### Vault

```bash
arra vault status             # Vault config & pending changes
arra vault sync               # Commit + push to GitHub
arra vault pull               # Pull vault files locally
arra vault init owner/repo    # Initialize vault
arra vault migrate --list     # Find repos with psi directories
```

### Global Options

Every command supports `--json` for machine-readable output:

```bash
arra stats --json
arra search "query" --json
arra server status --json
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ORACLE_URL` | `http://localhost:47778` | Full server URL (takes priority) |
| `ORACLE_PORT` | `47778` | Server port (used when `ORACLE_URL` is not set) |

Point to a remote Oracle server:

```bash
export ORACLE_URL=https://oracle.example.com
arra stats
```

## Architecture

```
arra ──HTTP──> arra-oracle server (:47778)
                    │
               ┌────┴────┐
               │ SQLite  │
               │ + FTS5  │
               │ + vec   │
               └─────────┘
```

- **9 commands** are pure HTTP (`fetch` against `/api/*`)
- **`server start`** spawns arra-oracle via `Bun.spawn(['bunx', 'arra-oracle', '--server'])`
- **`vault *`** delegates to `execSync('bunx arra-oracle vault ...')`

## Quick Run (no install)

```bash
bunx github:Soul-Brews-Studio/oracle-cli stats
bunx github:Soul-Brews-Studio/oracle-cli search "patterns"
```

## Development

```bash
ghq get -p Soul-Brews-Studio/oracle-cli
cd $(ghq root)/github.com/Soul-Brews-Studio/oracle-cli
bun install
bun run src/index.ts --help
bun run build   # type-check
```

## License

MIT
