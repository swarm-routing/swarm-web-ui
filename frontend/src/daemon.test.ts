// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
import { describe, expect, it } from 'vitest';
import { detectMode, viewsFor } from './daemon';

const reply = (status: number, body: unknown): typeof fetch =>
  (() => Promise.resolve(new Response(JSON.stringify(body), { status }))) as typeof fetch;

describe('detectMode', () => {
  it('is daemon when /api/health answers {"ok": true}', async () => {
    expect(await detectMode(reply(200, { ok: true }))).toBe('daemon');
  });
  it('is replay on a 404 (static hosting)', async () => {
    expect(await detectMode(reply(404, {}))).toBe('replay');
  });
  it('is replay when a static host answers 200 with something else', async () => {
    const html = (() => Promise.resolve(new Response('<!doctype html>', { status: 200 }))) as typeof fetch;
    expect(await detectMode(html)).toBe('replay');
    expect(await detectMode(reply(200, { ok: 'yes' }))).toBe('replay');
  });
  it('is replay when the request fails', async () => {
    expect(await detectMode((() => Promise.reject(new TypeError('offline'))) as typeof fetch)).toBe('replay');
  });
});

describe('viewsFor', () => {
  it('offers only the replay views without a daemon', () => {
    expect(viewsFor('replay').map((v) => v.id)).toEqual(['replay']);
  });
  it('offers every view behind the daemon', () => {
    expect(viewsFor('daemon').map((v) => v.id)).toEqual(['replay', 'runs']);
  });
});
