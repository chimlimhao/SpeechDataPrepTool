import { AuthResponse, LoginCredentials } from '@/types/auth.types';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  loginWithGoogle(): Promise<AuthResponse>;
  logout(): Promise<void>;
  getSession(): Promise<any>;
  subscribeToAuthChanges(callback: (user: any) => void): { unsubscribe: () => void };
} 