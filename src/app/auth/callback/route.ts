// Auth Callback Route Handler
// Handles OAuth redirects from providers like Google and LinkedIn

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // If no Supabase configured, redirect to next
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('id, onboarding_completed')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist (for OAuth users)
      if (!profile) {
        const metadata = data.user.user_metadata;
        const fullName = metadata?.full_name || metadata?.name ||
          `${metadata?.given_name || ''} ${metadata?.family_name || ''}`.trim() ||
          data.user.email?.split('@')[0] || 'User';

        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          avatar_url: metadata?.avatar_url || metadata?.picture || null,
          is_buyer: true, // Default to buyer
          is_seller: false,
          is_admin: false,
          onboarding_completed: false,
          seller_verified: false,
          seller_rating: 0,
          total_listings: 0,
          total_sales: 0,
          email_notifications: true,
          sms_notifications: false,
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        });

        // Redirect new users to onboarding
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
      }

      // Check if user is admin
      const { data: userProfile } = await (supabase.from('profiles') as any)
        .select('is_admin, onboarding_completed')
        .eq('id', data.user.id)
        .single();

      // Redirect admin users to admin dashboard
      if (userProfile?.is_admin && next === '/dashboard') {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin));
      }

      // Redirect to onboarding if not completed
      if (!userProfile?.onboarding_completed && next === '/dashboard') {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If there was an error or no code, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin?error=auth_failed', requestUrl.origin));
}
