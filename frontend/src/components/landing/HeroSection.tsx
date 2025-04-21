"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DecorativeBox } from "./DecorativeBox"
import { ProjectCard } from "./ProjectCard"

interface HeroSectionProps {
  title: string;
  description: string;
  label?: string;
  ctaText: string;
  ctaLink: string;
}

export function HeroSection({ 
  title, 
  description, 
  label, 
  ctaText, 
  ctaLink 
}: HeroSectionProps) {
  return (
    <div id="home" className="md:h-[912px] h-[710px] p-4 md:p-8 relative rounded-[35px] border border-border mt-5 overflow-hidden">
      {/* Radial Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/[0.03] [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        {/* Spotlight effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-teal-500/10" />
      </div>

      {/* Top Left Decorative Box */}
      <DecorativeBox 
        position="md:top-24 md:left-36 top-4 left-4" 
        rotate="-rotate-[15.11deg]" 
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 relative">
        <div className="mx-auto max-w-2xl text-center">
          {label && (
            <p className="relative inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-500 ring-1 ring-inset ring-teal-500/20">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
              {label}
            </p>
          )}
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-6 text-base md:text-lg leading-7 md:leading-8 text-muted-foreground">
            {description}
          </p>
          <div className="mt-8 md:mt-10 flex items-center justify-center gap-x-6">
            <Button className="px-4 py-2 md:px-6 md:py-3 bg-teal-500 text-white hover:bg-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Link href={ctaLink} className="text-base md:text-lg font-medium">
                {ctaText}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Left Floating Emoji */}
      <div className="hidden md:flex rotate-[-12deg] absolute top-10 bottom-10 left-10 p-6 w-24 h-24 md:w-32 md:h-32 bg-card/80 backdrop-blur-sm rounded-md shadow-lg items-center justify-center text-2xl transform hover:scale-105 transition-transform duration-200">
        🔉
      </div>

      {/* Right Floating Khmer Text */}
      <div className="hidden md:flex top-1/2 rotate-12 absolute bottom-10 right-10 p-6 w-24 h-24 md:w-32 md:h-32 bg-card/80 backdrop-blur-sm rounded-md shadow-lg items-center justify-center text-2xl italic transform hover:scale-105 transition-transform duration-200">
        ក ខ គ
      </div>

      {/* Project Stats Card */}
      <div className="mt-16 md:mt-0">
        <ProjectCard position="relative md:absolute md:bottom-12 md:left-4 md:z-20" />
      </div>

      {/* Bottom Right Decorative Box - Only visible on larger screens */}
      <div className="hidden md:block">
        <DecorativeBox 
          position="bottom-80 right-96" 
          rotate="rotate-[14deg]"
        />
      </div>

      {/* Spotlight Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
      </div>
    </div>
  )
} 