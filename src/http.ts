/**
 * Shared HTTP client for Oracle CLI
 *
 * Pure HTTP client — no server internals, no auto-start.
 * Requires oracle-v2 server to be running.
 */

const PORT = process.env.ORACLE_PORT || '47778';
const BASE_URL = `http://localhost:${PORT}`;

export interface FetchOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

export async function oracleFetch<T = any>(path: string, options?: FetchOptions): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }
  }

  const fetchOpts: RequestInit = { method: options?.method || 'GET' };
  if (options?.body) {
    fetchOpts.headers = { 'Content-Type': 'application/json' };
    fetchOpts.body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), fetchOpts);
  } catch {
    throw new Error(`Oracle server not running on port ${PORT}. Start with: oracle-cli server start`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
