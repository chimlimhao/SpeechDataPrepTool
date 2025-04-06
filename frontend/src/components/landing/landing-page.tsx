"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Layers, Menu, Clock, FileAudio, Download, Play } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import FeatureCard from "./FeatureCard"

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    // Header
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Somleng</h1>
        <nav className="hidden md:block">
        <Button
      className="bg-teal-500  rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
    ><Link href="/login">
    Get started →
  </Link>
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
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      
      
      <main className="container mx-auto px-4">

      <div className="md:h-[912px] h-[710px] p-4 relative rounded-[35px] border border-[#E6E6E6] mt-5 overflow-hidden bg-[radial-gradient(circle_at_center,#e6e6e6_1px,transparent_1px)] bg-[length:10px_10px]">
  {/* Radial Grid Background */}
  <div
    className="absolute -z-20 top-0 left-0 w-full h-full "
    style={{
      backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />


  {/* Top Left Rotated Box */}
  <div className="absolute -z-10 md:top-24 md:left-36 top-4 left-4 -rotate-[15.11deg]">
    <div
      className="size-16 md:size-20 lg:size-28 flex items-center justify-center rounded-xl lg:rounded-3xl border border-[#f3f3f3] shadow-[0px_5px_11px_0px_rgba(0,0,0,0.1),0px_20px_20px_0px_rgba(0,0,0,0.09),0px_44px_27px_0px_rgba(0,0,0,0.05),0px_79px_32px_0px_rgba(0,0,0,0.01),0px_123px_35px_0px_rgba(0,0,0,0)]"
      style={{
        background: 'linear-gradient(147.09deg, #fbfbfb 9.63%, #e8e8e8 91.74%)',
      }}
    />
  </div>

   {/* Top Body */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="relative inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600 ring-1 ring-inset ring-green-500/10">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-600" />
            New! Record user interviews without recording bots
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Unlock the Power of Khmer Speech!
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
          Transcribe, analyze, and enhance Khmer audio with cutting-edge AI technology. Focus on what
            matters - connecting with users.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
      className="bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
    ><Link href="/login">
    Get started - it's free →
  </Link>
    </Button>
    {/* Decorative Elements (Optional - for the floating cards) */}

<div className=" rotate-[-12deg] absolute top-10 bottom-10 left-10 p-6 w-32 h-32 bg-white-100 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl text-black-800">
🔉
</div>


<div className=" top-1/2 rotate-12 absolute bottom-10 right-10 p-6 w-32 h-32 bg-white/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl italic text-black-800">
  ក​ ខ គ
</div>



        </div>
      </div>
    </div>
   <div>

{/* Bottom Left*/}
   <div className="absolute bottom-12 left-4 z-20">
   <Card className="w-64 md:w-72 rounded-md shadow-md relative rotate-[20deg]">
      <CardContent className="p-4 space-y-3">
        {/* 1 */}
        <div className=" justify-center flex items-center space-x-2">
          <FileAudio className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-xs text-gray-600">Total Files</div>
            <div className="font-semibold text-lg">1</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Size</div>
          <div className="font-semibold text-lg">25.0 KB</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Duration</div>
          <div className="font-semibold text-lg">00:03</div>
        </div>        
        </div>
        {/* 2 */}
        <div className=" justify-center flex items-center space-x-2">
          <FileAudio className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-xs text-gray-600">Total Files</div>
            <div className="font-semibold text-lg">2</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Size</div>
          <div className="font-semibold text-lg">36.0 KB</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Duration</div>
          <div className="font-semibold text-lg">00:04</div>
        </div>        
        </div>
        {/* 3 */}
        <div className=" justify-center flex items-center space-x-2">
          <FileAudio className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-xs text-gray-600">Total Files</div>
            <div className="font-semibold text-lg">3</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Size</div>
          <div className="font-semibold text-lg">44.0 KB</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Duration</div>
          <div className="font-semibold text-lg">00:05</div>
        </div>        
        </div>


      </CardContent>
    </Card>
   </div>
  



        </div>
  {/* Bottom Right Rotated Box with SVG */}
  <div className="absolute -z-10 md:bottom-80 md:right-96 bottom-64 right-11 rotate-[14deg]">
    <div
      className="size-16 md:size-20 lg:size-28 flex items-center justify-center rounded-xl lg:rounded-3xl border border-[#f3f3f3] shadow-[0px_5px_11px_0px_rgba(0,0,0,0.1),0px_20px_20px_0px_rgba(0,0,0,0.09),0px_44px_27px_0px_rgba(0,0,0,0.05),0px_79px_32px_0px_rgba(0,0,0,0.01),0px_123px_35px_0px_rgba(0,0,0,0)]"
      style={{
        background: 'linear-gradient(147.09deg, #fbfbfb 9.63%, #e8e8e8 91.74%)',
      }}
    >
      <svg
        width="39"
        height="51"
        viewBox="0 0 39 51"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 md:h-20 md:w-20 h-10 w-10"
      >
        <defs>
          <filter
            id="filter0_di_309_821"
            x="0"
            y="0.5"
            width="39"
            height="50.3164"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="3" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_309_821" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_309_821" result="shape" />
            <feOffset />
            <feGaussianBlur stdDeviation="1.24444" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
            />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_309_821" />
          </filter>
          <linearGradient
            id="paint0_linear_309_821"
            x1="15"
            y1="3.93902"
            x2="41.039"
            y2="28.2012"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7BD1FF" />
            <stop offset="1" stopColor="#7BD1FF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</div>

 {/* Key Features */}
<div>
        <section className="py-12 md:py-20">
          <div className= "flex justify-center">
        <Button
      variant="secondary"
      className=" text-center rounded-full focus-visible:ring-2 text-sm font-medium shadow-md "
    >
      Key Features
    </Button>
    </div>
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Transform with Unrivaled Accuracy & Speed
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
          Effortlessly transcribe single recordings or process entire libraries of Khmer audio with our advanced AI-powered speech recognition and efficient batch processing capabilities.
          </p>
          </div>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
  <div className="flex justify-end">
    <FeatureCard
      icon={<Mic className="h-8 w-8 md:h-10 md:w-10 text-teal-500" />}
      title="Advanced Speech Recognition"
      description="State-of-the-art AI models trained specifically for Khmer language"
      delay={0.2}
    />
  </div>
  <div className="flex justify-start">
    <FeatureCard
      icon={<Layers className="h-8 w-8 md:h-10 md:w-10 text-teal-500" />}
      title="Batch Processing"
      description="Handle multiple audio files efficiently with our powerful tools"
      delay={0.6}
    />
  </div>
</div>
</section></div>



 <main className="container mx-auto px-4"> 

<div className="md:h-[912px] h-[710px] p-4 relative rounded-[35px] border border-[#E6E6E6] mt-5 overflow-hidden bg-[radial-gradient(circle_at_center,#e6e6e6_1px,transparent_1px)] bg-[length:10px_10px]">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Somleng</h1></header>
{/* Radial Grid Background */}
<div
className="absolute -z-20 top-0 left-0 w-full h-full "
style={{
backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
backgroundSize: '10px 10px',
}}
/>


{/* Top Left Rotated Box */}
<div className="absolute -z-10 md:top-24 md:left-36 top-4 left-4 -rotate-[15.11deg]">
<div
className="size-16 md:size-20 lg:size-28 flex items-center justify-center rounded-xl lg:rounded-3xl border border-[#f3f3f3] shadow-[0px_5px_11px_0px_rgba(0,0,0,0.1),0px_20px_20px_0px_rgba(0,0,0,0.09),0px_44px_27px_0px_rgba(0,0,0,0.05),0px_79px_32px_0px_rgba(0,0,0,0.01),0px_123px_35px_0px_rgba(0,0,0,0)]"
style={{
  background: 'linear-gradient(147.09deg, #fbfbfb 9.63%, #e8e8e8 91.74%)',
}}
/>
</div>

{/* Top Body */}
<div className="mx-auto max-w-7xl px-6 lg:px-8">
  <div className="mx-auto max-w-2xl text-center">
    <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
    Experience the Future of Khmer Speech Processing!
    </h1>
    <p className="mt-4 text-lg leading-8 text-gray-600">
            Join thousands of researchers, journalists, and language enthusiasts in revolutionizing Khmer audio analysis
          
    </p>
    <div className="mt-10 flex items-center justify-center gap-x-6">
    <Button
className="bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
><Link href="/login">
Start Your Free Trial →
</Link>
</Button>
{/* Decorative Elements (Optional - for the floating cards) */}

<div className=" rotate-12 absolute top-10 bottom-10 right-10 p-6 w-32 h-32 bg-white-100 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl text-black-800">
🔉
</div>


<div className="  rotate-[-12deg] absolute bottom-10 right-10 p-6 w-32 h-32 bg-white/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl italic text-black-800">
ក​ ខ គ
</div>
  </div>
</div>
</div>
<div>

{/* Bottom Left*/}
<div className="absolute bottom-12 left-4 z-20">
<Card className="w-64 md:w-72 rounded-md shadow-md relative rotate-[20deg]">
<CardContent className="p-4 space-y-3">
  {/* 1 */}
  <div className=" justify-center flex items-center space-x-2">
    <FileAudio className="h-5 w-5 text-gray-500" />
    <div>
      <div className="text-xs text-gray-600">Total Files</div>
      <div className="font-semibold text-lg">1</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Size</div>
    <div className="font-semibold text-lg">25.0 KB</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Duration</div>
    <div className="font-semibold text-lg">00:03</div>
  </div>        
  </div>
  {/* 2 */}
  <div className=" justify-center flex items-center space-x-2">
    <FileAudio className="h-5 w-5 text-gray-500" />
    <div>
      <div className="text-xs text-gray-600">Total Files</div>
      <div className="font-semibold text-lg">2</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Size</div>
    <div className="font-semibold text-lg">36.0 KB</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Duration</div>
    <div className="font-semibold text-lg">00:04</div>
  </div>        
  </div>
  {/* 3 */}
  <div className=" justify-center flex items-center space-x-2">
    <FileAudio className="h-5 w-5 text-gray-500" />
    <div>
      <div className="text-xs text-gray-600">Total Files</div>
      <div className="font-semibold text-lg">3</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Size</div>
    <div className="font-semibold text-lg">44.0 KB</div>
  </div>
  <div>
    <div className="text-xs text-gray-600">Total Duration</div>
    <div className="font-semibold text-lg">00:05</div>
  </div>        
  </div>
</CardContent>
</Card>
</div>
  </div>

{/* Bottom Right Rotated Box with SVG */}
<div className="absolute -z-10 md:bottom-80 md:right-96 bottom-64 right-11 rotate-[14deg]">
<div
className="size-16 md:size-20 lg:size-28 flex items-center justify-center rounded-xl lg:rounded-3xl border border-[#f3f3f3] shadow-[0px_5px_11px_0px_rgba(0,0,0,0.1),0px_20px_20px_0px_rgba(0,0,0,0.09),0px_44px_27px_0px_rgba(0,0,0,0.05),0px_79px_32px_0px_rgba(0,0,0,0.01),0px_123px_35px_0px_rgba(0,0,0,0)]"
style={{
  background: 'linear-gradient(147.09deg, #fbfbfb 9.63%, #e8e8e8 91.74%)',
}}
> 
<svg
  width="39"
  height="51"
  viewBox="0 0 39 51"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  className="flex-shrink-0 md:h-20 md:w-20 h-10 w-10"
>
  <defs>
    <filter
      id="filter0_di_309_821"
      x="0"
      y="0.5"
      width="39"
      height="50.3164"
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        result="hardAlpha"
      />
      <feOffset dy="3" />
      <feGaussianBlur stdDeviation="4.5" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"
      />
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_309_821" />
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_309_821" result="shape" />
      <feOffset />
      <feGaussianBlur stdDeviation="1.24444" />
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
      />
      <feBlend mode="normal" in2="shape" result="effect2_innerShadow_309_821" />
    </filter>
    <linearGradient
      id="paint0_linear_309_821"
      x1="15"
      y1="3.93902"
      x2="41.039"
      y2="28.2012"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#7BD1FF" />
      <stop offset="1" stopColor="#7BD1FF" stopOpacity="0" />
    </linearGradient>    
  </defs>
</svg>
</div>
</div>
</div>
</main>
      </main>

<footer className="bottom-0 py-6 md:py-8 mt-12 md:mt-20">
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

