"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react"
import { cn, formatFileSize } from "@/lib/utils"
import { useProject } from "@/providers/project.provider"
import { useToast } from "@/hooks/use-toast"
// @ts-ignore - Ignore type issues with WaveSurfer
import WaveSurfer from 'wavesurfer.js'

interface AudioFileDetailsProps {
  fileId: string
  fileName: string
  projectName?: string
  fileSize?: number
  status?: string
  transcription?: string
}

export function AudioFileDetails({ 
  fileId,
  fileName, 
  projectName,
  fileSize = 0,
  status = 'pending',
  transcription = ''
}: AudioFileDetailsProps) {
  const { getAudioFileContent, addTranscription } = useProject()
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [transcriptionText, setTranscriptionText] = useState(transcription)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCleanAudio, setIsCleanAudio] = useState(false)
  const [waveformReady, setWaveformReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const isComponentMounted = useRef(true)
  
  // Cleanup function for WaveSurfer
  const cleanupWaveSurfer = () => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.destroy()
      } catch (error) {
        console.error('Error destroying wavesurfer:', error)
      }
      wavesurferRef.current = null
    }
    setWaveformReady(false)
  }
  
  // Cleanup function for audio element
  const cleanupAudio = () => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause()
        audioElementRef.current.src = ''
        audioElementRef.current.load()
      } catch (error) {
        console.error('Error cleaning up audio element:', error)
      }
      audioElementRef.current = null
    }
    
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.load()
      } catch (error) {
        console.error('Error cleaning up audio ref:', error)
      }
    }
    
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }
  
  // Complete cleanup
  const cleanup = () => {
    cleanupWaveSurfer()
    cleanupAudio()
  }

  // Component mount/unmount effect
  useEffect(() => {
    isComponentMounted.current = true
    
    return () => {
      isComponentMounted.current = false
      cleanup()
    }
  }, [])

  // Fetch audio content when fileId changes
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    
    const fetchAudioContent = async () => {
      // Clean up before fetching new audio
      cleanup()
      
      if (!isMounted) return
      
      try {
        setIsLoading(true)
        setAudioUrl(null)
        
        // Get the signed URL from the server
        const url = await getAudioFileContent(fileId, status === 'completed')
        
        if (!isMounted) return
        
        // Create a new audio element
        const audio = new Audio()
        
        // Set up event listeners before setting the source
        const canPlayHandler = () => {
          if (!isMounted) return
          setDuration(audio.duration)
          setIsLoading(false)
          
          // Only set the audioUrl after we know the audio can play
          setAudioUrl(url)
          setIsCleanAudio(status === 'completed')
        }
        
        const errorHandler = (error: Event) => {
          if (!isMounted) return
          console.error('Error loading audio:', error)
          setIsLoading(false)
          toast({
            title: "Error loading audio",
            description: "Could not load the audio file",
            variant: "destructive",
          })
        }
        
        // Add event listeners
        audio.addEventListener('canplaythrough', canPlayHandler)
        audio.addEventListener('error', errorHandler)
        
        // Set the audio source and start loading
        audio.src = url
        audioElementRef.current = audio
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching audio file:', error)
        setIsLoading(false)
        toast({
          title: "Error loading audio",
          description: "Could not load the audio file",
          variant: "destructive",
        })
      }
    }

    fetchAudioContent()
    
    return () => {
      isMounted = false
      controller.abort()
      cleanup()
    }
  }, [fileId, getAudioFileContent, status, toast])

  // Initialize WaveSurfer only when audio is ready
  useEffect(() => {
    if (!isComponentMounted.current || !audioUrl || !waveformRef.current || !audioElementRef.current) return
    
    // Clean up any existing WaveSurfer instance
    cleanupWaveSurfer()
    
    let isMounted = true
    let wavesurfer: WaveSurfer | null = null
    
    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!isMounted) return
      
      try {
        wavesurfer = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: isCleanAudio ? '#4f46e5' : '#64748b',
          progressColor: isCleanAudio ? '#818cf8' : '#94a3b8',
          height: 80,
          normalize: true,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          media: audioElementRef.current!
        })
        
        wavesurfer.once('ready', () => {
          if (!isMounted) return
          setWaveformReady(true)
          setDuration(wavesurfer?.getDuration() || 0)
        })
        
        wavesurfer.on('timeupdate', () => {
          if (!isMounted) return
          setCurrentTime(wavesurfer?.getCurrentTime() || 0)
        })
        
        wavesurfer.on('finish', () => {
          if (!isMounted) return
          setIsPlaying(false)
        })
        
        wavesurfer.on('error', (error) => {
          console.error('WaveSurfer error:', error)
        })
        
        wavesurferRef.current = wavesurfer
      } catch (error) {
        console.error("Error initializing wavesurfer:", error)
        if (wavesurfer) {
          try {
            wavesurfer.destroy()
          } catch (destroyError) {
            console.error("Error destroying wavesurfer after init error:", destroyError)
          }
        }
      }
    }, 100)
    
    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      if (wavesurfer) {
        try {
          wavesurfer.destroy()
        } catch (error) {
          console.error("Error destroying wavesurfer in cleanup:", error)
        }
      }
    }
  }, [audioUrl, isCleanAudio])

  // Sync audio element with wavesurfer
  useEffect(() => {
    if (!audioRef.current || !wavesurferRef.current || !waveformReady) return;
    
    const handleTimeUpdate = () => {
      if (!isComponentMounted.current) return;
      if (audioRef.current && wavesurferRef.current) {
        try {
          const audioTime = audioRef.current.currentTime;
          const waveTime = wavesurferRef.current.getCurrentTime();
          
          // Only update if the difference is significant to avoid loops
          if (Math.abs(audioTime - waveTime) > 0.1) {
            wavesurferRef.current.setTime(audioTime);
          }
          setCurrentTime(audioTime);
        } catch (error) {
          // Ignore errors that might happen during state transitions
        }
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
      }
    };
  }, [audioUrl, waveformReady]);

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
    if (!audioRef.current || !wavesurferRef.current || !waveformReady) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        wavesurferRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              wavesurferRef.current?.play();
            })
            .catch(error => {
              console.error("Error playing audio:", error);
            });
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current || !wavesurferRef.current || !waveformReady) return;
    
    try {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      wavesurferRef.current.setTime(newTime);
      setCurrentTime(newTime);
    } catch (error) {
      console.error("Error changing time:", error);
    }
  };

  // Handle save transcription
  const handleSaveTranscription = async () => {
    if (!fileId || transcriptionText === transcription) return;
    
    console.log("Saving transcription for fileId:", fileId);
    console.log("New transcription text:", transcriptionText);
    
    try {
      setIsSaving(true);
      // Update the transcription content directly in the audio_files table
      const result = await addTranscription(fileId, transcriptionText);
      console.log("Save result:", result);
      
      toast({
        title: "Success",
        description: "Transcription saved successfully",
      });
    } catch (error) {
      console.error("Error saving transcription:", error);
      toast({
        title: "Error",
        description: "Failed to save transcription",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium truncate">{fileName}</h2>
        {projectName && <p className="text-sm text-muted-foreground">Project: {projectName}</p>}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="bg-accent rounded-md overflow-hidden flex items-center justify-center min-h-[80px] relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading audio...</span>
            </div>
          ) : (
            <>
              <div ref={waveformRef} className="w-full h-full" />
              {isCleanAudio && (
                <Badge variant="secondary" className="absolute top-2 right-2">
                  Noise Reduced
                </Badge>
              )}
            </>
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
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline" className={cn(
                {
                  'bg-green-100 text-green-600': status === 'completed',
                  'bg-orange-100 text-orange-600': status === 'pending',
                  'bg-blue-100 text-blue-600': status === 'processing',
                  'bg-red-100 text-red-600': status === 'failed'
                }
              )}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Button 
          className="w-full"
          onClick={handleSaveTranscription}
          disabled={isSaving || transcriptionText === transcription}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
    </div>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default AudioFileDetails

