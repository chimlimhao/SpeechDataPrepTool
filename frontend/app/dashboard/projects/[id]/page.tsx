"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Project, AudioFile } from "@/types/database.types"
import { UploadModal } from "@/components/dashboard/project-detail/upload-modal"
import { DatasetStats } from "@/components/dashboard/project-detail/dataset-stats"
import { AudioFileList } from "@/components/dashboard/project-detail/audio-file-list"
import { ProjectHeader } from "@/components/dashboard/project-detail/project-header"
import { useProjectActions } from "@/hooks/use-project-actions"
import { useProject } from "@/providers/project.provider"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { getProjectById, getProjectAudioFiles, subscribeToProjectChanges, subscribeToAudioFileChanges } = useProject()
  const { handleProcessFile, handleProcessAll } = useProjectActions()
  const { toast } = useToast()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [project, setProject] = useState<Project | null>(null)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjectData = useCallback(async () => {
    try {
      const [projectData, filesData] = await Promise.all([
        getProjectById(params.id),
        getProjectAudioFiles(params.id)
      ]);
      
      setProject(projectData);
      setAudioFiles(filesData);
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
  }, [params.id, getProjectById, getProjectAudioFiles, toast]);

  useEffect(() => {
    loadProjectData()

    // Subscribe to realtime changes
    const unsubscribeProject = subscribeToProjectChanges(params.id, (updatedProject) => {
      setProject(updatedProject)
    })

    const unsubscribeFiles = subscribeToAudioFileChanges(params.id, {
      onInsert: (newFile) => {
        setAudioFiles(prev => [newFile, ...prev])
      },
      onDelete: (fileId) => {
        setAudioFiles(prev => prev.filter(file => file.id !== fileId))
      },
      onUpdate: (updatedFile) => {
        setAudioFiles(prev => prev.map(file => 
          file.id === updatedFile.id ? updatedFile : file
        ))
      }
    })

    return () => {
      unsubscribeProject()
      unsubscribeFiles()
    }
  }, [params.id, loadProjectData, subscribeToProjectChanges, subscribeToAudioFileChanges])

  const handleFileUploaded = (newFile: AudioFile) => {
    // Update audio files list
    setAudioFiles(prev => [newFile, ...prev]);
    
    // Update project stats
    if (project) {
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          total_files: prev.total_files + 1,
          total_size: prev.total_size + newFile.file_size,
          total_duration: prev.total_duration + (newFile.duration || 0),
        };
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeader 
        project={project}
        onProcessAll={() => handleProcessAll(audioFiles, params.id)}
        onUpload={() => setIsUploadModalOpen(true)}
      />

      <div className="p-6 border-b">
        <DatasetStats project={project} />
      </div>

      <div className="flex-1 p-6">
        <AudioFileList 
          files={audioFiles}
          onProcessFile={handleProcessFile}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        projectId={params.id}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  )
} 