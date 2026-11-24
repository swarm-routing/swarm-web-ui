// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
//
// Whether the page is served by the daemon (ADR-0002 item 5). The same build
// runs as static files (replay views only) and behind the daemon (all views):
// it asks the same origin for /api/health and treats anything but a 200 with
// JSON `{"ok": true}` as "no daemon".

export type Mode = 'replay' | 'daemon';

export async function detectMode(fetcher: typeof fetch = fetch): Promise<Mode> {
  try {
    const r = await fetcher('api/health', { headers: { Accept: 'application/json' } });
    if (!r.ok) return 'replay';
    const body: unknown = await r.json();
    return typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true ? 'daemon' : 'replay';
  } catch {
    return 'replay';
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
