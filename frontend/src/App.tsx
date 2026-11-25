// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
//
// The skeleton (#8): a shell that lists the views the deployment offers.
// The replay views (#9 to #12) and the daemon's views (#16 to #19) fill it.
import { useEffect, useState } from 'react';
import { detectMode, viewsFor, type Mode } from './daemon';

export function App({ detect = detectMode }: { detect?: () => Promise<Mode> }) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    let live = true;
    void detect().then((m) => {
      if (live) setMode(m);
    });
    return () => {
      live = false;
    };
  }, [detect]);

  return (
    <>
      <header>
        <h1>swarm-web-ui</h1>
        <p>Replay simulation artifact bundles and compare runs.</p>
      </header>
      <main>
        {mode === null ? (
          <p role="status">Checking for a daemon…</p>
        ) : (
          <nav aria-label="Views">
            <ul>
              {viewsFor(mode).map((v) => (
                <li key={v.id}>{v.label}</li>
              ))}
            </ul>
            <p role="status">{mode === 'daemon' ? 'Connected to the daemon.' : 'Offline replay: no daemon.'}</p>
          </nav>
        )}
      </main>
    </>
  );
}
