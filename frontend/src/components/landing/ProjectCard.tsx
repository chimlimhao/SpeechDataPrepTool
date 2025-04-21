"use client"

import { FileAudio } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectEntryProps {
  fileCount: number;
  fileSize: string;
  duration: string;
}

function ProjectEntry({ fileCount, fileSize, duration }: ProjectEntryProps) {
  return (
    <div className="justify-center flex items-center space-x-2 md:space-x-3">
      <FileAudio className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
      <div>
        <div className="text-xs text-gray-600">Total Files</div>
        <div className="font-semibold text-base md:text-lg">{fileCount}</div>
      </div>
      <div>
        <div className="text-xs text-gray-600">Total Size</div>
        <div className="font-semibold text-base md:text-lg">{fileSize}</div>
      </div>
      <div>
        <div className="text-xs text-gray-600">Total Duration</div>
        <div className="font-semibold text-base md:text-lg">{duration}</div>
      </div>
    </div>
  )
}

interface ProjectCardProps {
  position?: string;
}

export function ProjectCard({ position = "" }: ProjectCardProps) {
  return (
    <div className={`${position} w-full md:w-auto transform rotate-[-3deg] hover:rotate-0 transition-transform duration-300`}>
      <div className="bg-card/95 backdrop-blur-sm border border-teal-500/20 rounded-xl p-4 shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_20px_rgba(20,184,166,0.2)] transition-shadow duration-300">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="size-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <svg
                  className="size-6 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">project-01</p>
              <p className="text-xs text-muted-foreground">testing</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-teal-500/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-teal-500 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground">100% complete</p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <svg
              className="mr-1.5 size-4 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Created: 4/17/2025
          </div>
        </div>
      </div>
    </div>
  );
} 