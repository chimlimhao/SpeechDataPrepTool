import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Default to dashboard if no 'next' parameter is provided
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  console.log('Auth callback received with code and next:', { 
    codeExists: !!code, 
    next,
    currentUrl: request.url,
    envVars: {
      vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
  })
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use the deployment URL if available, otherwise use the request origin
      let origin = requestUrl.origin;
      // Check if we're in production (Vercel)
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        origin = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        origin = process.env.NEXT_PUBLIC_SITE_URL;
      }
      
      // Make sure next starts with a slash
      const nextPath = next.startsWith('/') ? next : `/${next}`;
      const redirectUrl = new URL(nextPath, origin);
      
      console.log('Redirecting after successful auth to:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin));
} 