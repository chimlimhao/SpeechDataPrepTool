import type { Project, AudioFile, ProcessingLog, ProjectMember } from '@/types/database.types';
import { IProjectRepository, CreateProjectDTO, UpdateProjectDTO, CreateAudioFileDTO, CreateTranscriptionDTO } from '@/repositories/project.repository';

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async createProject(data: CreateProjectDTO): Promise<Project> {
    return this.projectRepository.createProject(data);
  }

  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    return this.projectRepository.updateProject(id, data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.projectRepository.deleteProject(id);
  }

  async getProject(id: string): Promise<Project> {
    return this.projectRepository.getProject(id);
  }

  async getProjects(): Promise<Project[]> {
    return this.projectRepository.getProjects();
  }

  async addAudioFile(data: CreateAudioFileDTO): Promise<AudioFile> {
    return this.projectRepository.addAudioFile(data);
  }

  async getProjectAudioFiles(projectId: string): Promise<AudioFile[]> {
    return this.projectRepository.getProjectAudioFiles(projectId);
  }

  async addTranscription(data: CreateTranscriptionDTO): Promise<ProcessingLog> {
    return this.projectRepository.addTranscription(data);
  }

  async getAudioFileTranscriptions(audioFileId: string): Promise<ProcessingLog[]> {
    return this.projectRepository.getAudioFileTranscriptions(audioFileId);
  }

  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    return this.projectRepository.addProjectMember(projectId, userId, role);
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.projectRepository.getProjectMembers(projectId);
  }
} 