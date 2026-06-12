import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseUrl } from './resolveSupabaseUrl';

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL, {
  dev: __DEV__,
  isPhysicalDevice: Constants.isDevice,
  debuggerHost:
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri,
});
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
