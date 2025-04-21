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
    currentUrl: request.url
  })
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use full origin with the next path
      const redirectUrl = new URL(next, requestUrl.origin)
      console.log('Redirecting after successful auth to:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Error exchanging code for session:', error)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
} 