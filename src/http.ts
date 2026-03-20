/**
 * Shared HTTP client for Oracle CLI
 *
 * Pure HTTP client — no server internals, no auto-start.
 * Requires arra-oracle server to be running.
 */

const BASE_URL = process.env.ORACLE_URL || `http://localhost:${process.env.ORACLE_PORT || '47778'}`;

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
    throw new Error(`Cannot connect to Oracle at ${BASE_URL}. Set ORACLE_URL or start with: arra server start`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
