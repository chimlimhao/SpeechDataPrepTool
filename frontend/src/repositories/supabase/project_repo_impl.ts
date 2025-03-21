import { supabase } from '@/lib/supabase/client';
import type { Project, AudioFile, ProcessingLog, ProjectMember } from '@/types/database.types';
import { IProjectRepository} from '@/repositories/project.repository';

export class SupabaseProjectRepositoryImpl implements IProjectRepository {
  async createProject(name: String, description?: String): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name,
        description: description,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  async updateProject(id: string, name?: String, description?: String): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name: name,
        description: description,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getProjectById(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return project;
  }

  async getProjects(): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;
    return projects;
  }

  async addAudioFile(projectId: string, fileName: String, filePath: String, duration?: number): Promise<AudioFile> {
    const { data: audioFile, error } = await supabase
      .from('audio_files')
      .insert({
        project_id: projectId,
        file_name: fileName,
        file_path: filePath,
        duration: duration,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return audioFile;
  }

  async getProjectAudioFiles(projectId: string): Promise<AudioFile[]> {
    const { data: audioFiles, error } = await supabase
      .from('audio_files')
      .select()
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return audioFiles;
  }

  async addTranscription(audioFileId: string, content: String, language?: String, confidence?: number): Promise<ProcessingLog> {
    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .insert({
        audio_file_id: audioFileId,
        content: content,
        language: language,
        confidence: confidence,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transcription;
  }

  async getAudioFileTranscriptions(audioFileId: string): Promise<ProcessingLog[]> {
    const { data: transcriptions, error } = await supabase
      .from('transcriptions')
      .select()
      .eq('audio_file_id', audioFileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return transcriptions;
  }

  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
      });

    if (error) throw error;
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data: members, error } = await supabase
      .from('project_members')
      .select()
      .eq('project_id', projectId);

    if (error) throw error;
    return members;
  }
} 