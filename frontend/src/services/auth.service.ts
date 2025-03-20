import { AuthResponse, LoginCredentials } from '@/types/auth.types';
import { IAuthRepository } from '@/repositories/auth.repository';

export class AuthService {
  constructor(private authRepository: IAuthRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.authRepository.login(credentials);
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    return this.authRepository.loginWithGoogle();
  }

  async logout(): Promise<void> {
    return this.authRepository.logout();
  }

  async getSession() {
    return this.authRepository.getSession();
  }

  subscribeToAuthChanges(callback: (user: any) => void) {
    return this.authRepository.subscribeToAuthChanges(callback);
  }
} 