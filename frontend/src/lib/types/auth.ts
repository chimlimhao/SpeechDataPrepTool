export type AuthProvider = 'google' | 'github' | 'email';

export interface ProviderConfig {
  name: string;
  logo: string;
  alt: string;
}

export const PROVIDER_CONFIG: Record<Exclude<AuthProvider, 'email'>, ProviderConfig> = {
  google: {
    name: 'Google',
    logo: 'https://authjs.dev/img/providers/google.svg',
    alt: 'Google logo'
  },
  github: {
    name: 'GitHub',
    logo: 'https://authjs.dev/img/providers/github.svg',
    alt: 'GitHub logo'
  }
}; 