// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
//
// Whether the page is served by the daemon (ADR-0002 item 5). The same build
// runs as static files (replay views only) and behind the daemon (all views):
// it asks the same origin for /api/health and treats anything but a 200 with
// JSON `{"ok": true}` within HEALTH_TIMEOUT_MS as "no daemon".

export type Mode = 'replay' | 'daemon';

/** One deadline for the request and its body: a stalled host never holds the page. */
export const HEALTH_TIMEOUT_MS = 3000;

export async function detectMode(fetcher: typeof fetch = fetch, timeoutMs = HEALTH_TIMEOUT_MS): Promise<Mode> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<Mode>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve('replay');
    }, timeoutMs);
  });
  const probe = (async (): Promise<Mode> => {
    try {
      const r = await fetcher('api/health', { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!r.ok) return 'replay';
      const body: unknown = await r.json();
      return typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true ? 'daemon' : 'replay';
    } catch {
      return 'replay';
    }
  })();
  try {
    return await Promise.race([probe, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

export interface View {
  id: string;
  label: string;
  needsDaemon: boolean;
}

export const VIEWS: readonly View[] = [
  { id: 'replay', label: 'Replay', needsDaemon: false },
  { id: 'runs', label: 'Runs', needsDaemon: true },
];

export function viewsFor(mode: Mode): View[] {
  return VIEWS.filter((v) => mode === 'daemon' || !v.needsDaemon);
}
