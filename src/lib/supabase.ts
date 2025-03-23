import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// In a development environment, use fallback URLs when environment variables are missing
const isDev = import.meta.env.DEV;

// Get Supabase URL and key from environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tlbygdxblfpqnheqsuzw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnlnZHhibGZwcW5oZXFzdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzEwMTEsImV4cCI6MjA1ODIwNzAxMX0.bAddhrdShtjK0wbGuP7B1wf1XFUsZJzy1prYyiXi8as';

// Show warning if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
  console.warn('For setting up your Supabase project manually, run the SQL below in the Supabase SQL editor:');
  console.warn(`
-- Create tables for Boardgame Bash Planner App

-- Create boardgames table
CREATE TABLE IF NOT EXISTS boardgames (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  complexity_rating NUMERIC NOT NULL,
  video_url TEXT,
  bgg_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  boardgames UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participations table
CREATE TABLE IF NOT EXISTS participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  attendee_name TEXT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attending BOOLEAN NOT NULL,
  rankings JSONB,
  excluded UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO users (name, is_admin) VALUES ('Admin User', TRUE);
INSERT INTO boardgames (title, description, complexity_rating)
VALUES 
  ('Catan', 'Build settlements and trade resources', 2.3),
  ('Ticket to Ride', 'Connect cities with train routes', 1.8);

-- Insert sample event
INSERT INTO events (title, description, date, boardgames)
SELECT 'Game Night', 'Monthly boardgame event', NOW() + INTERVAL '7 days', ARRAY_AGG(id)
FROM boardgames;
  `);
}

// Create and export Supabase client with proper auth settings
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'boardgame-bash-auth-token',
    }
  }
);

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
