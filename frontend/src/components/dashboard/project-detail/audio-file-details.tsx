"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react"
import { cn, formatFileSize } from "@/lib/utils"
import { useProject } from "@/providers/project.provider"
import { useToast } from "@/hooks/use-toast"

interface AudioFileDetailsProps {
  fileId: string
  fileName: string
  projectName?: string
  fileSize?: number
  sampleRate?: number
  status?: string
  transcription?: string
}

export function AudioFileDetails({ 
  fileId,
  fileName, 
  projectName,
  fileSize = 0,
  sampleRate = 44.1,
  status = 'pending',
  transcription = ''
}: AudioFileDetailsProps) {
  const { getAudioFileContent } = useProject()
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [transcriptionText, setTranscriptionText] = useState(transcription)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchAudioContent = async () => {
      try {
        setIsLoading(true)
        const url = await getAudioFileContent(fileId)
        setAudioUrl(url)
      } catch (error) {
        console.error('Error fetching audio file:', error)
        toast({
          title: "Error loading audio",
          description: "Could not load the audio file",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAudioContent()
  }, [fileId, getAudioFileContent, toast])

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      
      // Clean up event listeners
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        }
      };
    }
  }, [audioUrl]);

  // Update transcriptionText state when the prop changes (when switching files)
  useEffect(() => {
    setTranscriptionText(transcription);
  }, [transcription, fileId]);

  // Reset player state when changing files
  useEffect(() => {
    // Reset play state and time when switching files
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    return () => {
      // Pause audio when unmounting or changing files
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [fileId]);

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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium truncate">{fileName}</h2>
        {projectName && <p className="text-sm text-muted-foreground">Project: {projectName}</p>}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="bg-accent rounded-md overflow-hidden flex items-center justify-center min-h-[80px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading audio...</span>
            </div>
          ) : (
            <canvas ref={canvasRef} width="300" height="80" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={isLoading || !audioUrl}>
              {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            </Button>
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSliderChange}
              className="flex-1"
              disabled={isLoading || !audioUrl}
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

      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </div>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default AudioFileDetails

