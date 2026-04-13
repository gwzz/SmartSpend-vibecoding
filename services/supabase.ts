import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars supporting both CRA (process.env) and Vite (import.meta.env)
const getEnv = (key: string, viteKey: string): string => {
  // Check process.env (Node/CRA/Webpack)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  
  // Check import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      return import.meta.env[viteKey] as string;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }
  return '';
};

const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabasePublishableKey =
  getEnv('REACT_APP_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnv('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const missingConfigMessage =
  'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before starting SmartSpend.';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : new Proxy(
      {},
      {
        get() {
          throw new Error(missingConfigMessage);
        },
      }
    );
