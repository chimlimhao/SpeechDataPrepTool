"use client"
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthResponse } from '@/types/auth.types';
import { authRepository } from '@/repositories/supabase';

// Step 1: Define what data and functions our auth context will provide
interface AuthContextType {
  user: User | null;        // Current user data
  loading: boolean;         // Loading state for async operations
  error: Error | null;      // Error state for error handling
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;      // Login function
  loginWithGoogle: () => Promise<AuthResponse>;                         // Google login function
  logout: () => Promise<void>;                                         // Logout function
}

// Step 2: Create the context with our defined type
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Step 3: Set up state management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Step 4: Set up authentication listener
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        setLoading(true);
        const session = await authRepository.getSession();
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

    // Set up subscription to auth state changes
    // This is like setting up a listener that watches for auth changes
    const subscription = authRepository.subscribeToAuthChanges((user) => {
      setUser(user);
    });

    // Cleanup: Remove subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array means this effect runs once when component mounts

  // Step 5: Define auth functions
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authRepository.login(credentials);
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
      const response = await authRepository.loginWithGoogle();
      if (response.error) throw response.error;
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
      await authRepository.logout();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 6: Provide the context to children
  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 7: Create a hook to easily use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 