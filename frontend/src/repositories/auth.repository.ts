import { AuthResponse, LoginCredentials } from '@/types/auth.types';
import { supabase } from '@/lib/supabase/client';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  loginWithGoogle(): Promise<AuthResponse>;
  logout(): Promise<void>;
  getSession(): Promise<any>;
  subscribeToAuthChanges(callback: (user: any) => void): { unsubscribe: () => void };
}

export class SupabaseAuthRepository implements IAuthRepository {
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;

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

  async getSession(): Promise<any> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  subscribeToAuthChanges(callback: (user: any) => void): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user || null);
      }
    );
    return subscription;
  }
} 