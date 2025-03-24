import type { Project, AudioFile, ProcessingLog, ProjectMember } from '@/types/database.types'

export interface IProjectRepository {
  createProject(name: string, description?: string): Promise<Project>
  updateProject(id: string, name?: string, description?: string): Promise<Project>
  deleteProject(id: string): Promise<void>
  getProjectById(id: string): Promise<Project>
  getProjects(): Promise<Project[]>
  addAudioFile(projectId: string, file: File, duration?: number): Promise<AudioFile>
  getProjectAudioFiles(projectId: string): Promise<AudioFile[]>
  getAudioFileContent(fileId: string): Promise<string>
  addTranscription(audioFileId: string, content: string, language?: string, confidence?: number): Promise<AudioFile>
  getAudioFileTranscriptions(audioFileId: string): Promise<any[]>
  addProjectMember(projectId: string, userId: string, role: string): Promise<void>
  getProjectMembers(projectId: string): Promise<ProjectMember[]>
  triggerProjectProcessing(projectId: string): Promise<void>
  subscribeToProjectChanges(projectId: string, onUpdate: (project: Project) => void): () => void
  subscribeToAudioFileChanges(
    projectId: string, 
    callbacks: {
      onInsert?: (file: AudioFile) => void
      onDelete?: (fileId: string) => void
      onUpdate?: (file: AudioFile) => void
    }
  ): () => void
} 