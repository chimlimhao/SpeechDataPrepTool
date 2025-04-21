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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
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
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
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

      {dimensions.width > 0 && (
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

