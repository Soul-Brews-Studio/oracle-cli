# oracle-cli

Standalone command-line interface for [Oracle](https://github.com/Soul-Brews-Studio/oracle-v2) knowledge base.

Pure HTTP client — no server internals, no database access. Talks to the Oracle server over `localhost`.

## Usage

No install needed — run directly from GitHub:

```bash
bunx github:Soul-Brews-Studio/oracle-cli <command>
```

## Prerequisites

Oracle server must be running. Start it with:

```bash
oracle-cli server start
```

This spawns `oracle-v2` in the background. You need [oracle-v2](https://github.com/Soul-Brews-Studio/oracle-v2) installed or available via `bunx`.

## Commands

### Knowledge Base

```bash
oracle-cli search <query>           # Search (hybrid, fts, or vector)
oracle-cli search "patterns" -l 5   # Limit results
oracle-cli search "vault" -m fts    # FTS-only mode
oracle-cli search "auth" -p myproj  # Filter by project

oracle-cli learn -p "lesson text"   # Add a learning
oracle-cli learn -p "lesson" -c "tag1,tag2" --origin human

oracle-cli list                     # List documents
oracle-cli list -t learning -l 20   # Filter by type

oracle-cli stats                    # Knowledge base statistics
```

### Threads

```bash
oracle-cli threads                  # List threads
oracle-cli threads -s open          # Open threads only
oracle-cli thread <id>              # View thread + messages
```

### Schedule

```bash
oracle-cli schedule                 # List upcoming events
oracle-cli schedule list -d 2026-03-05
oracle-cli schedule add -d 2026-03-10 -e "Meeting" -t 14:00
```

### Traces & Inbox

```bash
oracle-cli traces                   # List discovery traces
oracle-cli trace <id>               # View a trace
oracle-cli inbox                    # View handoff inbox
```

### Server Management

```bash
oracle-cli server status            # Check if running
oracle-cli server start             # Start oracle-v2 server
oracle-cli server stop              # Graceful HTTP shutdown
```

### Vault

```bash
oracle-cli vault status             # Vault config & pending changes
oracle-cli vault sync               # Commit + push to GitHub
oracle-cli vault pull               # Pull vault files locally
oracle-cli vault init owner/repo    # Initialize vault
oracle-cli vault migrate --list     # Find repos with psi directories
```

### Global Options

Every command supports `--json` for machine-readable output:

```bash
oracle-cli stats --json
oracle-cli search "query" --json
oracle-cli server status --json
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ORACLE_PORT` | `47778` | Server port |

## Architecture

```
oracle-cli ──HTTP──> oracle-v2 server (:47778)
                         │
                    ┌────┴────┐
                    │ SQLite  │
                    │ + FTS5  │
                    │ + vec   │
                    └─────────┘
```

- **9 commands** are pure HTTP (`fetch` against `/api/*`)
- **`server start`** spawns oracle-v2 via `Bun.spawn(['bunx', 'oracle-v2', '--server'])`
- **`vault *`** delegates to `execSync('bunx oracle-v2 vault ...')`

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
