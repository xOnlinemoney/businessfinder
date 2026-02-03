// Supabase Middleware
// Handles session refresh and auth state management

import { NextResponse, type NextRequest } from 'next/server';

// Dynamic import to avoid module loading issues
let createServerClient: any;
let CookieOptions: any;
try {
  const ssr = require('@supabase/ssr');
  createServerClient = ssr.createServerClient;
  CookieOptions = ssr.CookieOptions;
} catch (e) {
  console.warn('Failed to load @supabase/ssr, running without Supabase');
}

import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && createServerClient);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip Supabase operations if not configured
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Refresh the session if it exists
  await supabase.auth.getUser();

  return response;
}

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/onboarding',
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
];

// Routes that require seller role
const sellerRoutes = [
  '/dashboard/listings/new',
  '/dashboard/listings/[id]/edit',
  '/sell',
];

export async function authMiddleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Skip auth checks if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Check if route is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
    if (!user) {
      // Redirect to admin login
      return NextResponse.redirect(new URL('/auth/bf-admin-x9k4m', request.url));
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean | null; role: string | null } | null };

    if (!profile?.is_admin && profile?.role !== 'super_admin') {
      // Not an admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Check if route is protected (non-admin)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!user) {
      // Redirect to signin
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  return response;
}
