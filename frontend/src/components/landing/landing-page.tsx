"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NavBar } from "./NavBar"
import { HeroSection } from "./HeroSection"
import { FeaturesSection } from "./FeaturesSection"
import { FAQSection } from "./FAQSection"
import { Footer } from "./Footer"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const handleScroll = () => setScrollY(window.scrollY)
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    
    // Check for auth code in URL
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    
    if (code) {
      console.log("Auth code detected in landing page, processing...")
      // Exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          console.log("Successfully authenticated, redirecting to dashboard")
          router.push('/dashboard')
        } else {
          console.error("Auth error:", error)
          setLoading(false)
        }
      })
    } else {
      // Check if already authenticated
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          console.log("User already authenticated, redirecting to dashboard")
          router.push('/dashboard')
        } else {
          setLoading(false)
        }
      })
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event)
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log("User signed in, redirecting to dashboard")
          router.push('/dashboard')
        }
      }
    )
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      subscription?.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>

      <NavBar />
      
      <main className="container mx-auto px-4">
        <HeroSection 
          title="Unlock the Power of Khmer Speech!"
          description="Transcribe, analyze, and enhance Khmer audio with cutting-edge AI technology. Focus on what matters - connecting with users."
          label="New! Record user interviews without recording bots"
          ctaText="Get started - it's free →"
          ctaLink="/login"
        />

        <FeaturesSection />
        
        <FAQSection />
      </main>

      <Footer />

      {mounted && dimensions.width > 0 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${scrollY % dimensions.width}px ${scrollY % dimensions.height}px, rgba(147, 51, 234, 0.05) 0%, transparent 15%)`,
          }}
        />
      )}
    </div>
  )
}

