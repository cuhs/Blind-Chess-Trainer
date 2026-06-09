import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

/**
 * Physical devices cannot reach the dev machine at 127.0.0.1. In dev, derive the
 * LAN host from Expo's debugger connection (same IP Metro uses for Expo Go).
 */
function resolveSupabaseUrl(configured: string | undefined): string | undefined {
  if (!configured) return undefined;
  if (!__DEV__) return configured;

  const isLoopback =
    configured.includes('127.0.0.1') || configured.includes('localhost');
  if (!isLoopback) return configured;

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
  const lanHost = debuggerHost?.split(':')[0];
  if (!lanHost || lanHost === '127.0.0.1' || lanHost === 'localhost') {
    return configured;
  }

  return configured
    .replace('127.0.0.1', lanHost)
    .replace('localhost', lanHost);
}

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
