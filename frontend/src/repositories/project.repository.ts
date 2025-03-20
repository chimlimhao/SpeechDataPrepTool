import type { Project, AudioFile, ProcessingLog, ProjectMember, ProjectStatus } from '@/types/database.types'

export interface CreateProjectDTO {
  name: string
  description?: string
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
  status?: ProjectStatus
  progress?: number
}

export interface CreateAudioFileDTO {
  project_id: string
  file_name: string
  file_path: string
  duration?: number
}

export interface CreateTranscriptionDTO {
  audio_file_id: string
  content: string
  language?: string
  confidence?: number
}

export interface IProjectRepository {
  createProject(data: CreateProjectDTO): Promise<Project>
  updateProject(id: string, data: UpdateProjectDTO): Promise<Project>
  deleteProject(id: string): Promise<void>
  getProject(id: string): Promise<Project>
  getProjects(): Promise<Project[]>
  addAudioFile(data: CreateAudioFileDTO): Promise<AudioFile>
  getProjectAudioFiles(projectId: string): Promise<AudioFile[]>
  addTranscription(data: CreateTranscriptionDTO): Promise<ProcessingLog>
  getAudioFileTranscriptions(audioFileId: string): Promise<ProcessingLog[]>
  addProjectMember(projectId: string, userId: string, role: string): Promise<void>
  getProjectMembers(projectId: string): Promise<ProjectMember[]>
} 