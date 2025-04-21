import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DecorativeBox } from "./DecorativeBox"
import { ProjectCard } from "./ProjectCard"

interface CallToActionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export function CallToAction({ 
  title, 
  description, 
  ctaText, 
  ctaLink 
}: CallToActionProps) {
  return (
    <div className="md:h-[912px] h-[710px] p-4 relative rounded-[35px] border border-[#E6E6E6] mt-5 overflow-hidden bg-[radial-gradient(circle_at_center,#e6e6e6_1px,transparent_1px)] bg-[length:10px_10px]">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Somleng</h1>
      </header>
      
      {/* Radial Grid Background */}
      <div
        className="absolute -z-20 top-0 left-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />

      {/* Top Left Decorative Box */}
      <DecorativeBox 
        position="md:top-24 md:left-36 top-4 left-4" 
        rotate="-rotate-[15.11deg]" 
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {description}
          </p>
          <p className="text-lg text-muted-foreground">
            Start transcribing your Khmer audio files today. No credit card required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button className="bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
              <Link href={ctaLink}>
                {ctaText}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Floating Emoji */}
      <div className="rotate-12 absolute top-10 bottom-10 right-10 p-6 w-32 h-32 bg-white-100 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl text-black-800">
        🔉
      </div>

      {/* Bottom Right Floating Khmer Text */}
      <div className="rotate-[-12deg] absolute bottom-10 right-10 p-6 w-32 h-32 bg-white/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-2xl italic text-black-800">
        ក​ ខ គ
      </div>

      {/* Project Stats Card */}
      <ProjectCard />

      {/* Bottom Right Decorative Box */}
      <DecorativeBox 
        position="md:bottom-80 md:right-96 bottom-64 right-11" 
        rotate="rotate-[14deg]"
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
      </DecorativeBox>
    </div>
  )
} 