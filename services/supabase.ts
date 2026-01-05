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

// Prioritize Environment Variables, fallback to provided hardcoded credentials
const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL') || 'https://hkpclanwaxalolzopich.supabase.co';
const supabaseAnonKey = getEnv('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'sb_publishable_GwFkmFXDVS3h-N28R1fLNQ_fV72K0_6';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App authentication and storage will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);