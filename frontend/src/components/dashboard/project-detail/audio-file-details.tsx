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
  sampleRate?: number
  status?: string
  transcription?: string
}

// Audio blob cache to keep loaded audio data in memory
// This reduces repeated downloads while navigating between files
const audioBlobCache = new Map<string, { blob: Blob, url: string, isClean: boolean }>();

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
  const [isCleanAudio, setIsCleanAudio] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  
  // Check if we already have the audio cached
  const cachedAudio = useMemo(() => audioBlobCache.get(fileId), [fileId]);

  useEffect(() => {
    const fetchAudioContent = async () => {
      try {
        setIsLoading(true)
        setAudioReady(false)
        
        // Check if we already have this audio cached in memory
        if (cachedAudio) {
          console.log(`Using cached audio for file ${fileId}`);
          setAudioUrl(cachedAudio.url);
          setIsCleanAudio(cachedAudio.isClean);
          return;
        }
        
        // Otherwise fetch from the server (which uses SessionStorage cache)
        const url = await getAudioFileContent(fileId)
        
        // Download the audio data once and cache it
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Store in our memory cache
        const isClean = status === 'completed' && url.includes('_cleaned');
        audioBlobCache.set(fileId, {
          blob,
          url: blobUrl,
          isClean
        });
        
        // Update state
        setAudioUrl(blobUrl);
        setIsCleanAudio(isClean);
      } catch (error) {
        console.error('Error fetching audio file:', error)
        toast({
          title: "Error loading audio",
          description: "Could not load the audio file",
          variant: "destructive",
        })
      } finally {
        // Don't set isLoading to false here - we'll do that after the audio loads
      }
    }

    fetchAudioContent()
    
    // Cleanup URL when component unmounts
    return () => {
      // We don't revoke the URL here because we want to keep it cached
      // It will be automatically cleaned up when the page refreshes
    };
  }, [fileId, getAudioFileContent, toast, status, cachedAudio])

  // Create an audio element to preload the audio content
  useEffect(() => {
    if (!audioUrl) return;
    
    // Clean up any previous audio element
    if (audioElementRef.current) {
      audioElementRef.current.remove();
    }
    
    // Create a new audio element to preload the audio
    const audioElement = new Audio(audioUrl);
    audioElementRef.current = audioElement;
    
    const handleCanPlay = () => {
      setAudioReady(true);
      setIsLoading(false);
      setDuration(audioElement.duration);
    };
    
    const handleError = (error: any) => {
      console.error('Error loading audio:', error);
      toast({
        title: "Error loading audio",
        description: "Could not load the audio file",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    
    audioElement.addEventListener('canplaythrough', handleCanPlay);
    audioElement.addEventListener('error', handleError);
    
    // Start loading the audio
    audioElement.load();
    
    return () => {
      audioElement.removeEventListener('canplaythrough', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
      audioElement.pause();
      
      if (audioElementRef.current === audioElement) {
        audioElementRef.current = null;
      }
    };
  }, [audioUrl, toast]);

  // Initialize WaveSurfer when audio is ready
  useEffect(() => {
    if (!audioReady || !audioUrl || !waveformRef.current) return;

    // Clean up previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    try {
      // Create WaveSurfer instance
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: isCleanAudio ? '#4f46e5' : '#64748b',
        progressColor: isCleanAudio ? '#818cf8' : '#94a3b8',
        url: audioUrl,
        height: 80,
        normalize: true,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        // Add media option to use our preloaded audio element
        media: audioElementRef.current || undefined
      });

      wavesurferRef.current = wavesurfer;

      // Set up event handlers
      wavesurfer.on('ready', () => {
        if (audioRef.current) {
          setDuration(wavesurfer.getDuration());
        }
      });

      wavesurfer.on('timeupdate', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on('interaction', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
        if (audioRef.current) {
          audioRef.current.currentTime = wavesurfer.getCurrentTime();
        }
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
      });
    } catch (error) {
      console.error("Error initializing wavesurfer:", error);
      // We can still let user play audio even if waveform fails
    }

    // Clean up
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, audioReady, isCleanAudio]);

  // Sync audio element with wavesurfer
  useEffect(() => {
    if (!audioRef.current || !wavesurferRef.current) return;

    const handleTimeUpdate = () => {
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
  }, [audioUrl, audioReady]);

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
    if (audioRef.current && wavesurferRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        wavesurferRef.current.pause();
      } else {
        audioRef.current.play();
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current && wavesurferRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      wavesurferRef.current.setTime(newTime);
      setCurrentTime(newTime);
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

