import { describe, expect, it } from 'vitest';
import { resolveSupabaseUrl } from './resolveSupabaseUrl';

const LOCAL = 'http://127.0.0.1:54321';

describe('resolveSupabaseUrl', () => {
  it('returns undefined when not configured', () => {
    expect(resolveSupabaseUrl(undefined)).toBeUndefined();
  });

  it('returns configured URL in production', () => {
    expect(resolveSupabaseUrl(LOCAL, { dev: false })).toBe(LOCAL);
  });

  it('keeps loopback on simulator in dev', () => {
    expect(
      resolveSupabaseUrl(LOCAL, {
        dev: true,
        isPhysicalDevice: false,
        debuggerHost: '10.0.0.57:8081',
      }),
    ).toBe(LOCAL);
  });

  it('rewrites loopback to LAN on physical device in dev', () => {
    expect(
      resolveSupabaseUrl(LOCAL, {
        dev: true,
        isPhysicalDevice: true,
        debuggerHost: '10.0.0.57:8081',
      }),
    ).toBe('http://10.0.0.57:54321');
  });

  it('rewrites localhost on physical device in dev', () => {
    expect(
      resolveSupabaseUrl('http://localhost:54321', {
        dev: true,
        isPhysicalDevice: true,
        debuggerHost: '192.168.1.10:8081',
      }),
    ).toBe('http://192.168.1.10:54321');
  });

  it('leaves non-loopback URLs unchanged in dev', () => {
    const remote = 'https://abc.supabase.co';
    expect(
      resolveSupabaseUrl(remote, {
        dev: true,
        isPhysicalDevice: true,
        debuggerHost: '10.0.0.57:8081',
      }),
    ).toBe(remote);
  });

  it('keeps loopback when debugger host is loopback', () => {
    expect(
      resolveSupabaseUrl(LOCAL, {
        dev: true,
        isPhysicalDevice: true,
        debuggerHost: '127.0.0.1:8081',
      }),
    ).toBe(LOCAL);
  });
});
