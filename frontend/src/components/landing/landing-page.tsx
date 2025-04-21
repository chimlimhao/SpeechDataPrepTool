"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NavBar } from "./NavBar"
import { HeroSection } from "./HeroSection"
import { FeaturesSection } from "./FeaturesSection"
import { FAQSection } from "./FAQSection"
import { Footer } from "./Footer"

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>

      <NavBar />
      
      <main className="container mx-auto px-4">
        {/* First Hero Section */}
        <HeroSection 
          title="Unlock the Power of Khmer Speech!"
          description="Transcribe, analyze, and enhance Khmer audio with cutting-edge AI technology. Focus on what matters - connecting with users."
          label="New! Record user interviews without recording bots"
          ctaText="Get started - it's free →"
          ctaLink="/login"
        />

        {/* Features Section */}
        <FeaturesSection />
        
        {/* FAQ Section */}
        <FAQSection />
      </main>

      <Footer />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${scrollY % window.innerWidth}px ${scrollY % window.innerHeight}px, rgba(147, 51, 234, 0.05) 0%, transparent 15%)`,
        }}
      />
    </div>
  )
}

