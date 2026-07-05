// Minimal ambient types for Cloudflare Pages Functions.
//
// This project doesn't depend on @cloudflare/workers-types (Astro's static
// build never touches functions/). If that package is added later its
// declarations simply take over — these are intentionally the small subset
// this codebase actually uses.

interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: unknown;
}

interface KVNamespace {
  get(key: string, options?: { type?: 'text' }): Promise<string | null>;
  put(key: string, value: string, options?: KVNamespacePutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    keys: { name: string; expiration?: number }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

interface PagesFunctionContext<Env = unknown> {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil(promise: Promise<unknown>): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
}

type PagesFunction<Env = unknown> = (
  context: PagesFunctionContext<Env>
) => Response | Promise<Response>;
