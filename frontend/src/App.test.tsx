// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from './App';

afterEach(cleanup);

describe('App', () => {
  it('shows only the replay views with no daemon', async () => {
    render(<App detect={() => Promise.resolve('replay')} />);
    expect(await screen.findByText('Offline replay: no daemon.')).toBeTruthy();
    expect(screen.queryByText('Runs')).toBeNull();
  });
  it('shows every view behind the daemon', async () => {
    render(<App detect={() => Promise.resolve('daemon')} />);
    expect(await screen.findByText('Connected to the daemon.')).toBeTruthy();
    expect(screen.getByText('Runs')).toBeTruthy();
  });
});
