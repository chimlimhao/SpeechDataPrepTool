"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, AudioWaveformIcon as Waveform, Layers, ArrowRight, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type React from "react"

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Khmer Speech Tool</h1>
        <nav className="hidden md:block">
          <Button asChild variant="ghost" className="text-foreground hover:text-primary">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:text-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col space-y-4 mt-8">
              <Link href="/login" className="text-lg text-foreground hover:text-primary">
                Login
              </Link>
              <Link href="/register" className="text-lg text-foreground hover:text-primary">
                Register
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-12 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-primary">Unlock the Power of Khmer Speech</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transcribe, analyze, and enhance Khmer audio with cutting-edge AI technology
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/register">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </section>

        <section className="py-12 md:py-20">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-primary">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<Mic className="h-8 w-8 md:h-10 md:w-10" />}
              title="Advanced Speech Recognition"
              description="State-of-the-art AI models trained specifically for Khmer language"
              delay={0.2}
            />
            <FeatureCard
              icon={<Waveform className="h-8 w-8 md:h-10 md:w-10" />}
              title="Audio Enhancement"
              description="Noise reduction and clarity improvement for crystal-clear results"
              delay={0.4}
            />
            <FeatureCard
              icon={<Layers className="h-8 w-8 md:h-10 md:w-10" />}
              title="Batch Processing"
              description="Handle multiple audio files efficiently with our powerful tools"
              delay={0.6}
            />
          </div>
        </section>

        <section className="py-12 md:py-20 text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-primary">
            Experience the Future of Khmer Speech Processing
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of researchers, journalists, and language enthusiasts in revolutionizing Khmer audio analysis
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/register">Start Your Free Trial</Link>
          </Button>
        </section>
      </main>

      <footer className="bg-secondary py-6 md:py-8 mt-12 md:mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Khmer Speech Tool. All rights reserved.
        </div>
      </footer>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${scrollY % window.innerWidth}px ${scrollY % window.innerHeight}px, rgba(147, 51, 234, 0.05) 0%, transparent 15%)`,
        }}
      />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay }}>
      <div className="p-6 bg-card rounded-lg shadow-sm border border-accent">
        <div className="mb-4 inline-block p-3 bg-accent rounded-full text-primary">{icon}</div>
        <h4 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{title}</h4>
        <p className="text-sm md:text-base text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

