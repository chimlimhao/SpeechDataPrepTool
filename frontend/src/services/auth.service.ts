import { AuthResponse, LoginCredentials } from '@/types/auth.types';
import { authRepository } from '@/repositories/implementations';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return authRepository.login(credentials);
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    return authRepository.loginWithGoogle();
  }

  async logout(): Promise<void> {
    return authRepository.logout();
  }

  async getSession() {
    return authRepository.getSession();
  }

  subscribeToAuthChanges(callback: (user: any) => void) {
    return authRepository.subscribeToAuthChanges(callback);
  }
} 