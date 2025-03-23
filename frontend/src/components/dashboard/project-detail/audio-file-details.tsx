"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, PauseCircle } from "lucide-react"
import { cn, formatFileSize } from "@/lib/utils"

interface AudioFileDetailsProps {
  fileName: string
  projectName?: string
  fileSize?: number
  sampleRate?: number
  status?: string
  transcription?: string
}

export function AudioFileDetails({ 
  fileName, 
  projectName,
  fileSize = 0,
  sampleRate = 44.1,
  status = 'pending',
  transcription = ''
}: AudioFileDetailsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [transcriptionText, setTranscriptionText] = useState(transcription)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current!.duration)
      })
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current!.currentTime)
      })
    }
  }, [])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  return (
    <div className="flex flex-col h-full ">
      <div className="p-4 border-b">
        <h2 className="font-medium truncate">{fileName}</h2>
        {projectName && <p className="text-sm text-muted-foreground">Project: {projectName}</p>}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="bg-accent rounded-md overflow-hidden">
          <canvas ref={canvasRef} width="300" height="80" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={togglePlayPause}>
              {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            </Button>
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSliderChange}
              className="flex-1"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcription" className="text-sm">
            Transcription
          </Label>
          <Textarea
            id="transcription"
            placeholder="Enter Khmer transcription here..."
            className="h-32 resize-none"
            value={transcriptionText}
            onChange={(e) => setTranscriptionText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">File Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{formatTime(duration)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{formatFileSize(fileSize)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sample Rate</p>
              <p className="font-medium">{sampleRate} kHz</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline" className={cn(
                {
                  'bg-green-500/10 text-green-700 border-green-500/20': status === 'completed',
                  'bg-orange-500/10 text-orange-700 border-orange-500/20': status === 'pending',
                  'bg-blue-500/10 text-blue-700 border-blue-500/20': status === 'processing',
                  'bg-red-500/10 text-red-700 border-red-500/20': status === 'failed'
                }
              )}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <Button className="w-full">Save Changes</Button>
      </div>


      <audio ref={audioRef} src={`/api/audio/${fileName}`} />
    </div>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default AudioFileDetails

