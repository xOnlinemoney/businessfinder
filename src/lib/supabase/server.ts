// Supabase Server Configuration
// This file provides the Supabase client for server-side usage (Server Components, API Routes)

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Create a Supabase client for Server Components
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Handle cookies in Server Components (read-only)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Handle cookies in Server Components (read-only)
        }
      },
    },
  });
}

// Create a Supabase client for API Routes
export function createRouteHandlerClient(cookieStore: ReturnType<typeof cookies>) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        // @ts-ignore - cookies() returns a Promise in newer Next.js
        return cookieStore.get?.(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // @ts-ignore
        cookieStore.set?.({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // @ts-ignore
        cookieStore.set?.({ name, value: '', ...options });
      },
    },
  });
}
