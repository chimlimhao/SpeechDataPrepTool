"use client";

import { LandingPage } from "@/components/landing/landing-page"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check for auth code in URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (code) {
        console.log("Auth code detected in home page URL");
        // Directly exchange the code for a session
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (!error && data.session) {
            console.log("Home: Successfully authenticated, redirecting to dashboard");
            router.push('/dashboard');
          } else {
            console.error("Home: Error exchanging code for session:", error);
          }
        });
      }
    }
  }, [router]);

  return <LandingPage />
}

