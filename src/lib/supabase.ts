
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// In a development environment, use fallback URLs when environment variables are missing
const isDev = import.meta.env.DEV;

// Get Supabase URL and key from environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (isDev ? 'https://your-supabase-project.supabase.co' : '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (isDev ? 'your-public-anon-key' : '');

// Show warning if variables are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Using development placeholders or mock client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for production use.');
}

// Create and export Supabase client with fallback to a mock client if credentials are missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

// Mock client implementation for development when credentials are missing
function createMockSupabaseClient() {
  // This is a simplified mock implementation
  console.info('Using mock Supabase client for development');
  
  const mockMethods = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
    removeChannel: () => {},
  };

  return mockMethods as unknown as ReturnType<typeof createClient<Database>>;
}
