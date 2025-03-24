"use client"

import { Button } from "@/components/ui/button"
import { Upload, PlayCircle } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Project, AudioFile } from "@/types/database.types"
import { useProjectActions } from "@/hooks/use-project-actions"
import { ExportDatasetButton } from "./export-dataset-button"

interface ProjectHeaderProps {
  project: Project
  audioFiles: AudioFile[]
  onProcessAll: () => void
  onUpload: () => void
}

export function ProjectHeader({ project, audioFiles, onProcessAll, onUpload }: ProjectHeaderProps) {
  const { handleProcessAll, isProcessing } = useProjectActions()
  const hasCompletedFiles = audioFiles.some(file => file.transcription_status === 'completed')
  
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <ExportDatasetButton 
          projectId={project.id} 
          projectName={project.name}
          disabled={audioFiles.length === 0}
        />
        <Button 
          variant="outline"
          onClick={() => handleProcessAll(audioFiles, project.id)}
          className="gap-2"
          disabled={isProcessing}
        >
          <PlayCircle className="h-4 w-4" />
          Process All
        </Button>
        <Button onClick={onUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  )
} 