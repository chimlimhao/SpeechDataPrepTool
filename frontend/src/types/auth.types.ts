export interface User {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 