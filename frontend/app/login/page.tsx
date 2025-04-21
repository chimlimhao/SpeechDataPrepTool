"use client";

import { LoginForm } from "@/components/auth/login-form"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    });

    // Also check for auth code in URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (code) {
        console.log("Auth code detected in login page URL");
        // Exchange the code for a session
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (!error && data.session) {
            console.log("Login page: Successfully authenticated, redirecting to dashboard");
            router.push('/dashboard');
          } else {
            console.error("Login page: Error exchanging code for session:", error);
            setIsLoading(false);
          }
        });
      }
    }
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}

