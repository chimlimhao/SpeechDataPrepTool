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
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { AudioFileDetails } from "@/components/dashboard/project-detail/audio-file-details"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { getProjectById, getProjectAudioFiles, subscribeToProjectChanges, subscribeToAudioFileChanges } = useProject()
  const { handleProcessFile, handleProcessAll } = useProjectActions()
  const { toast } = useToast()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [project, setProject] = useState<Project | null>(null)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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
        setAudioFiles(prev => {
          // Check if file already exists to prevent duplicates
          if (prev.some(file => file.id === newFile.id)) {
            return prev;
          }
          return [newFile, ...prev];
        });
      },
      onDelete: (fileId) => {
        setAudioFiles(prev => prev.filter(file => file.id !== fileId))
      },
      onUpdate: (updatedFile) => {
        setAudioFiles(prev => {
          // Check if the file exists before updating
          if (!prev.some(file => file.id === updatedFile.id)) {
            return prev;
          }
          return prev.map(file => 
            file.id === updatedFile.id ? updatedFile : file
          );
        });
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

  const toggleExpansion = (expand: boolean, file?: AudioFile | null) => {
    setIsExpanded(expand);
    setSelectedFile(file || null);
  };

  const handleFileSelect = (file: AudioFile | null) => {
    if (file) {
      // If a file is selected, expand the panel
      toggleExpansion(true, file);
    } else {
      // If no file is selected, collapse the panel
      toggleExpansion(false, null);
    }
  };

  const handleClosePanel = () => {
    // First set expanded to false to trigger animation
    setIsExpanded(false);
    // Then after animation completes, reset the selected file
    setTimeout(() => {
      setSelectedFile(null);
    }, 300); // Matching the transition duration
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
        audioFiles={audioFiles}
        onProcessAll={() => handleProcessAll(audioFiles, params.id)}
        onUpload={() => setIsUploadModalOpen(true)}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <motion.div 
            className="flex flex-col w-full"
            animate={{ 
              width: isExpanded ? "60%" : "100%",
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-b">
              <DatasetStats project={project} />
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <AudioFileList 
                files={audioFiles}
                onProcessFile={handleProcessFile}
                onViewModeChange={setViewMode}
                viewMode={viewMode}
                selectedFile={selectedFile}
                onSelectFile={handleFileSelect}
                isExpanded={isExpanded}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {isExpanded && selectedFile && (
              <motion.div
                className="border-l h-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="h-full relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 z-10"
                    onClick={handleClosePanel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <AudioFileDetails 
                    fileId={selectedFile.id}
                    fileName={selectedFile.file_name} 
                    projectName={project?.name || ''}
                    fileSize={selectedFile.file_size}
                    sampleRate={selectedFile.sample_rate || 44.1}
                    status={selectedFile.transcription_status}
                    transcription={selectedFile.transcription_content || ''}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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