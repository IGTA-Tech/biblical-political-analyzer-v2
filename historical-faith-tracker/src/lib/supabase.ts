import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client for browser/client-side usage
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side Supabase client (uses service role key for elevated permissions)
export function createServerSupabaseClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Server Supabase credentials not available');
    return supabase; // Fall back to anon client
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Database types for the historical faith tracker tables
export interface Database {
  public: {
    Tables: {
      timeline_events: {
        Row: {
          id: string;
          title: string;
          year_start: number;
          year_end: number | null;
          event_type: string;
          traditions_affected: string[];
          summary: string;
          location: string | null;
          location_lat: number | null;
          location_lng: number | null;
          sources: string[] | null;
          significance: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          year_start: number;
          year_end?: number | null;
          event_type: string;
          traditions_affected: string[];
          summary: string;
          location?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          sources?: string[] | null;
          significance?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          year_start?: number;
          year_end?: number | null;
          event_type?: string;
          traditions_affected?: string[];
          summary?: string;
          location?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          sources?: string[] | null;
          significance?: string | null;
          updated_at?: string;
        };
      };
      eras: {
        Row: {
          id: string;
          name: string;
          start_year: number;
          end_year: number;
          color: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_year: number;
          end_year: number;
          color: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          start_year?: number;
          end_year?: number;
          color?: string;
          description?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// Helper function to fetch timeline events with filters
export async function fetchTimelineEvents(filters?: {
  traditions?: string[];
  eventTypes?: string[];
  yearStart?: number;
  yearEnd?: number;
  searchQuery?: string;
}) {
  let query = supabase
    .from('timeline_events')
    .select('*')
    .order('year_start', { ascending: true });

  if (filters?.traditions?.length) {
    query = query.overlaps('traditions_affected', filters.traditions);
  }

  if (filters?.eventTypes?.length) {
    query = query.in('event_type', filters.eventTypes);
  }

  if (filters?.yearStart !== undefined) {
    query = query.gte('year_start', filters.yearStart);
  }

  if (filters?.yearEnd !== undefined) {
    query = query.lte('year_start', filters.yearEnd);
  }

  if (filters?.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,summary.ilike.%${filters.searchQuery}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch timeline events: ${error.message}`);
  }

  return data;
}

// Helper function to fetch eras
export async function fetchEras() {
  const { data, error } = await supabase
    .from('eras')
    .select('*')
    .order('start_year', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch eras: ${error.message}`);
  }

  return data;
}

// Helper function to fetch a single event by ID
export async function fetchEventById(id: string) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  return data;
}
