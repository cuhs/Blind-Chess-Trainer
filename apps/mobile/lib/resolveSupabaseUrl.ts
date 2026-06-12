export interface ResolveSupabaseUrlOptions {
  /** When false, return configured URL unchanged. */
  dev?: boolean;
  /** False for simulators/emulators — keep loopback. True for physical devices — rewrite to LAN. */
  isPhysicalDevice?: boolean;
  /** Metro debugger host, e.g. `10.0.0.57:8081`. */
  debuggerHost?: string | null;
}

/**
 * Physical devices cannot reach the dev machine at 127.0.0.1. In dev on a real
 * device, derive the LAN host from Expo's debugger connection (same IP Metro uses).
 * Simulators share the host loopback — rewriting to LAN breaks local Supabase.
 */
export function resolveSupabaseUrl(
  configured: string | undefined,
  options: ResolveSupabaseUrlOptions = {},
): string | undefined {
  if (!configured) return undefined;

  const { dev = false, isPhysicalDevice = true, debuggerHost } = options;
  if (!dev) return configured;

  const isLoopback =
    configured.includes('127.0.0.1') || configured.includes('localhost');
  if (!isLoopback) return configured;

  if (!isPhysicalDevice) return configured;

  const lanHost = debuggerHost?.split(':')[0];
  if (!lanHost || lanHost === '127.0.0.1' || lanHost === 'localhost') {
    return configured;
  }

  return configured
    .replace('127.0.0.1', lanHost)
    .replace('localhost', lanHost);
}
