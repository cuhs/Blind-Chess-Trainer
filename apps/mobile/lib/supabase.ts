import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseUrl } from './resolveSupabaseUrl';

const debuggerHost =
  Constants.expoGoConfig?.debuggerHost ??
  Constants.expoConfig?.hostUri ??
  null;

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL, {
  dev: __DEV__,
  isPhysicalDevice: Device.isDevice,
  debuggerHost,
});
const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, publishableKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
