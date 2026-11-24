// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
//
// One build for both deployments (ADR-0002 item 5): static files for the
// offline replay, and the same files served by the Go daemon (#16). The dev
// server proxies /api and /ws to a local daemon in development only.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const daemon = process.env.SWARM_WEB_UI_DAEMON ?? 'http://127.0.0.1:8080';

export default defineConfig({
  plugins: [react()],
  base: './', // relative asset paths: served from any directory, as the site's pinned demo is (#15)
  server: {
    proxy: {
      '/api': daemon,
      '/ws': { target: daemon, ws: true },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
