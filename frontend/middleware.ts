import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Log the request path
    console.log('Middleware - Request path:', request.nextUrl.pathname)

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Log session state
    console.log('Middleware - Session state:', session ? 'Authenticated' : 'Not authenticated')

    // Define public routes that don't require authentication
    const isPublicRoute = 
      request.nextUrl.pathname === "/" || // Landing page
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/register");

    // Define protected routes that require authentication
    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith("/dashboard");

    if (!session && isProtectedRoute) {
      console.log('Middleware - Redirecting to login due to no session')
      // Redirect to login if accessing protected routes without auth
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (session && (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login")) {
      console.log('Middleware - Redirecting to dashboard as user is already authenticated')
      // Redirect to dashboard if accessing login/home while authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    console.log('Middleware - Allowing request to proceed')
    return NextResponse.next()
  } catch (error) {
    // Log error details
    console.error('Middleware - Error:', error)
    // If there's an error checking the session, redirect to login
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 