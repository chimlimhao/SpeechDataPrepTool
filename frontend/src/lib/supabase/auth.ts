import { User, AuthError } from '@supabase/supabase-js';

/**
 * Supported authentication providers
 */
export type AuthProvider = 'google' | 'github' | 'linkedin' | 'email';

/**
 * Standard response format for authentication operations
 */
export interface AuthResponse<T = undefined> {
  data: T | null;
  error: AuthError | Error | null;
}

/**
 * User data returned from authentication operations
 */
export interface AuthUserData {
  user: User | null;
}

/**
 * Standard response format for authentication operations in the UI layer
 */
export interface AuthUIResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string | undefined;
  };
}

/**
 * Configuration for an authentication provider
 */
export interface ProviderConfig {
  /** Display name of the provider */
  name: string;
  /** URL to the provider's logo */
  logo: string;
  /** Alt text for the logo */
  alt: string;
}

/**
 * Configuration for all supported OAuth providers
 */
export const PROVIDER_CONFIG: Record<Exclude<AuthProvider, 'email'>, ProviderConfig> = {
  google: {
    name: "Google",
    logo: "https://authjs.dev/img/providers/google.svg",
    alt: "Google logo",
  },
  github: {
    name: "GitHub",
    logo: "https://authjs.dev/img/providers/github.svg",
    alt: "GitHub logo",
  },
  linkedin: {
    name: "LinkedIn",
    logo: "https://authjs.dev/img/providers/linkedin.svg",
    alt: "LinkedIn logo",
  },
}; 