import { AuthResponse, LoginCredentials } from '@/types/auth.types';
import { supabase } from '@/lib/supabase/client';
import { IAuthRepository } from '../auth.repository';

export class SupabaseAuthRepositoryImpl implements IAuthRepository {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Get domain dynamically - use Vercel URL in production or local URL in development
      let redirectDomain = typeof window !== 'undefined' ? window.location.origin : '';
      
      // If we're on Vercel, use the actual deployment URL
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        redirectDomain = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        redirectDomain = process.env.NEXT_PUBLIC_SITE_URL;
      }
      
      console.log('Using redirect domain:', redirectDomain);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectDomain}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      
      // Return null user as the actual user data will be available after redirect
      return {
        user: null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  subscribeToAuthChanges(callback: (user: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user || null);
      }
    );
    return subscription;
  }
} 