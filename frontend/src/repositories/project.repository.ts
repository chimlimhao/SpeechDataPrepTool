import type { Project, AudioFile, ProcessingLog, ProjectMember } from '@/types/database.types'

export interface IProjectRepository {
  createProject(name: String, description?: String): Promise<Project>
  updateProject(id: string, name?: String, description?: String): Promise<Project>
  deleteProject(id: string): Promise<void>
  getProjectById(id: string): Promise<Project>
  getProjects(): Promise<Project[]>
  addAudioFile(projectId: string, fileName: String, filePath: String, duration?: number): Promise<AudioFile>
  getProjectAudioFiles(projectId: string): Promise<AudioFile[]>
  addTranscription(audioFileId: string, content: String, language?: String, confidence?: number): Promise<ProcessingLog>
  getAudioFileTranscriptions(audioFileId: string): Promise<ProcessingLog[]>
  addProjectMember(projectId: string, userId: string, role: string): Promise<void>
  getProjectMembers(projectId: string): Promise<ProjectMember[]>
} 