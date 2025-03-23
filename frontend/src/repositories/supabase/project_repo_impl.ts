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
    const user = await supabase.auth.getUser();
    const { data: projects, error } = await supabase
      .from('projects')
      .select()
      .eq('created_by', user.data.user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return projects;
  }

  async addAudioFile(projectId: string, file: File, duration?: number): Promise<AudioFile> {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${projectId}/${Date.now()}-${file.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 2. Create database record
    const { data: audioFile, error: dbError } = await supabase
      .from('audio_files')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_path_raw: filePath,
        file_size: file.size,
        format: fileExt,
        duration: duration,
        transcription_status: 'pending',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (dbError) throw dbError
    return audioFile
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

  subscribeToProjectChanges(projectId: string, onUpdate: (project: Project) => void): () => void {
    const subscription = supabase
      .channel('project_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      }, (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Project)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  subscribeToAudioFileChanges(
    projectId: string,
    callbacks: {
      onInsert?: (file: AudioFile) => void
      onDelete?: (fileId: string) => void
      onUpdate?: (file: AudioFile) => void
    }
  ): () => void {
    const subscription = supabase
      .channel('audio_files_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audio_files',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        if (payload.new && callbacks.onInsert) {
          callbacks.onInsert(payload.new as AudioFile)
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'audio_files',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        if (payload.old && callbacks.onDelete) {
          callbacks.onDelete(payload.old.id)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'audio_files',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        if (payload.new && callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as AudioFile)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  async triggerProjectProcessing(projectId: string): Promise<void> {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`http://localhost:8080/project/process/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to trigger project processing');
    }
  }
} 