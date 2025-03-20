"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { ChevronLeft, Upload, Search, Grid, List, FileAudio, Play, AlertCircle, PlayCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Project, AudioFile } from "@/types/database.types"
import { formatDuration, cn } from "@/lib/utils"
import { UploadModal, type UploadSettings } from "@/components/dashboard/project-detail/upload-modal"
import { supabase } from "@/lib/supabase/client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.round(audio.duration));
    });
    audio.addEventListener('error', reject);
    audio.src = URL.createObjectURL(file);
  });
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [project, setProject] = useState<Project | null>(null)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjectData = useCallback(async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select()
        .eq('id', params.id)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch audio files
      const { data: filesData, error: filesError } = await supabase
        .from('audio_files')
        .select()
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })

      if (filesError) throw filesError
      setAudioFiles(filesData)
    } catch (error) {
      console.error('Error loading project:', error)
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [params.id, toast])

  useEffect(() => {
    loadProjectData()

    // Subscribe to realtime changes
    const projectSubscription = supabase
      .channel('project_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${params.id}`,
      }, (payload) => {
        if (payload.new) {
          // Directly update project state with new data
          setProject(payload.new as Project)
        }
      })
      .subscribe()

    const filesSubscription = supabase
      .channel('audio_files_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audio_files',
        filter: `project_id=eq.${params.id}`,
      }, (payload) => {
        if (payload.new) {
          // Add new file to the list
          setAudioFiles(prev => [payload.new as AudioFile, ...prev])
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'audio_files',
        filter: `project_id=eq.${params.id}`,
      }, (payload) => {
        if (payload.old) {
          // Remove file from the list
          setAudioFiles(prev => prev.filter(file => file.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      projectSubscription.unsubscribe()
      filesSubscription.unsubscribe()
    }
  }, [params.id, loadProjectData])

  const handleUpload = async (files: FileList, settings: UploadSettings) => {
    try {
      for (const file of Array.from(files)) {
        // Get audio duration
        const duration = await getAudioDuration(file);
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const filePath = `${params.id}/${Date.now()}-${file.name}`
        
        const { error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Create audio file record
        const { data: audioFile, error: dbError } = await supabase
          .from('audio_files')
          .insert({
            project_id: params.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            format: fileExt,
            duration: duration,
            transcription_status: 'pending',
            created_by: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Update local state immediately
        setAudioFiles(prev => [audioFile, ...prev])
        
        // Update project stats immediately
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            total_files: prev.total_files + 1,
            total_size: prev.total_size + file.size,
            total_duration: prev.total_duration + duration
          };
        });
      }

      setIsUploadModalOpen(false)
      toast({
        title: "Success",
        description: `Uploaded ${files.length} files successfully`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    }
  }

  const handleProcessFile = async (fileId: string) => {
    try {
      // Update file status to processing
      const { error: updateError } = await supabase
        .from('audio_files')
        .update({ transcription_status: 'processing' })
        .eq('id', fileId)

      if (updateError) throw updateError

      // TODO: Call your transcription service here
      // For now, we'll simulate processing with a timeout
      setTimeout(async () => {
        const { error } = await supabase
          .from('audio_files')
          .update({
            transcription_status: 'completed',
            transcription_content: 'Sample transcription content'
          })
          .eq('id', fileId)

        if (error) {
          console.error('Error updating transcription status:', error)
        }
      }, 3000)

      toast({
        title: "Processing Started",
        description: "The file is being processed",
      })
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      })
    }
  }

  const handleProcessAll = async () => {
    const pendingFiles = audioFiles.filter(
      file => file.transcription_status === 'pending' || file.transcription_status === 'failed'
    )
    
    if (pendingFiles.length === 0) {
      toast({
        title: "No files to process",
        description: "All files have been processed or are currently processing",
      })
      return
    }

    toast({
      title: "Processing Started",
      description: `Starting to process ${pendingFiles.length} files`,
    })

    // Process files sequentially
    for (const file of pendingFiles) {
      try {
        // Update file status to processing
        const { error: updateError } = await supabase
          .from('audio_files')
          .update({ transcription_status: 'processing' })
          .eq('id', file.id)

        if (updateError) throw updateError

        // TODO: Replace this with your actual transcription service call
        await new Promise(resolve => setTimeout(resolve, 3000))

        const { error } = await supabase
          .from('audio_files')
          .update({
            transcription_status: 'completed',
            transcription_content: 'Sample transcription content'
          })
          .eq('id', file.id)

        if (error) throw error

      } catch (error) {
        console.error(`Error processing file ${file.file_name}:`, error)
        // Update file status to failed
        await supabase
          .from('audio_files')
          .update({ transcription_status: 'failed' })
          .eq('id', file.id)
      }
    }

    toast({
      title: "Processing Complete",
      description: "All files have been processed",
    })
  }

  const filteredFiles = audioFiles.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {/* <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator /> */}
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleProcessAll}
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Process All
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b">
        <div className="flex items-center gap-3 p-4 rounded-lg border">
          <FileAudio className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Total Files</p>
            <p className="text-2xl font-bold">{project.total_files}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Total Size</p>
            <p className="text-2xl font-bold">{formatFileSize(project.total_size)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Total Duration</p>
            <p className="text-2xl font-bold">{project.total_duration ? formatDuration(project.total_duration) : '0:00'}</p>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{file.file_name}</TableCell>
                  <TableCell>{file.duration ? formatDuration(file.duration) : '-'}</TableCell>
                  <TableCell>{formatFileSize(file.file_size)}</TableCell>
                  <TableCell>{file.format?.toUpperCase() || '-'}</TableCell>
                  <TableCell>
                    <span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        {
                          'bg-green-100 text-green-600': file.transcription_status === 'completed',
                          'bg-orange-100 text-orange-600': file.transcription_status === 'pending',
                          'bg-blue-100 text-blue-600': file.transcription_status === 'processing',
                          'bg-red-100 text-red-600': file.transcription_status === 'failed'
                        }
                      )}
                    >
                      {file.transcription_status.charAt(0).toUpperCase() + file.transcription_status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProcessFile(file.id)
                            }}
                            disabled={file.transcription_status === 'processing' || file.transcription_status === 'completed'}
                          >
                            {file.transcription_status === 'failed' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {file.transcription_status === 'completed' 
                            ? 'Already processed'
                            : file.transcription_status === 'processing'
                            ? 'Processing in progress'
                            : file.transcription_status === 'failed'
                            ? 'Retry processing'
                            : 'Process file'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No files found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
} 