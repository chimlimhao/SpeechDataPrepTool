import { useState, useCallback, useEffect } from 'react';
import { User, LoginCredentials } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';

const authService = new AuthService();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const subscription = authService.subscribeToAuthChanges((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      if (response.error) throw response.error;
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.loginWithGoogle();
      if (response.error) throw response.error;
      // Don't set user here as it will be handled by the auth state change subscription
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
  };
} 