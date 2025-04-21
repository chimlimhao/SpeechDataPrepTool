'use client'
import { createBrowserClient } from "@supabase/ssr";

// Get the site URL for redirects
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  return 'http://localhost:3000';
};

// Create a singleton instance
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Also export the create function for flexibility
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Add utility function to get avatar URL
export function getAvatarUrl(avatarPath: string | null): string {
  if (!avatarPath) return '/placeholder-avatar.png';
  
  // If it's already a full URL, return it
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // If it's a storage path, get the public URL
  const supabase = createClient();
  if (avatarPath.startsWith('/avatars/')) {
    avatarPath = avatarPath.replace('/avatars/', '');
  }
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarPath);
  
  return publicUrl || '/placeholder-avatar.png';
}
