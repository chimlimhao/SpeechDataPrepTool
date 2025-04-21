import { supabase } from '@/lib/supabase/client';
import type { Project, AudioFile, ProcessingLog, ProjectMember } from '@/types/database.types';
import { IProjectRepository} from '@/repositories/project.repository';
import JSZip from 'jszip';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProjectRepositoryImpl implements IProjectRepository {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createProject(name: string, description: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([{ name, description }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProject(id: string, name?: string, description?: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getProjects(): Promise<Project[]> {
    const user = await this.supabase.auth.getUser();
    const { data: projects, error } = await this.supabase
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
    
    const { error: uploadError } = await this.supabase.storage
      .from('audio-files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 2. Create database record
    const { data: audioFile, error: dbError } = await this.supabase
      .from('audio_files')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_path_raw: filePath,
        file_size: file.size,
        format: fileExt,
        duration: duration,
        transcription_status: 'pending',
        created_by: (await this.supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (dbError) throw dbError
    return audioFile
  }

  async getProjectAudioFiles(projectId: string): Promise<AudioFile[]> {
    const { data: audioFiles, error } = await this.supabase
      .from('audio_files')
      .select()
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return audioFiles;
  }

  async getAudioFileContent(fileId: string, useCleanedVersion: boolean = false): Promise<string> {
    try {
      // First get the file metadata from the database
      const { data: fileData, error: fileError } = await this.supabase
        .from('audio_files')
        .select('file_path_raw, file_path_cleaned')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;
      if (!fileData) throw new Error('File not found');

      // Determine which path to use
      const filePath = useCleanedVersion && fileData.file_path_cleaned 
        ? fileData.file_path_cleaned 
        : fileData.file_path_raw;

      // Get the signed URL for the file
      const { data, error: signedUrlError } = await this.supabase
        .storage
        .from('audio-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) throw signedUrlError;
      if (!data?.signedUrl) throw new Error('Could not generate signed URL');

      return data.signedUrl;
    } catch (error) {
      console.error('Repository: Error getting audio file content:', error);
      throw error;
    }
  }

  async addTranscription(audioFileId: string, content: string, language?: string, confidence?: number): Promise<AudioFile> {
    console.log("Repository: Saving transcription for fileId:", audioFileId);
    console.log("Repository: Content to save:", content);
    
    // Update the audio file transcription directly
    const { data: audioFile, error } = await this.supabase
      .from('audio_files')
      .update({
        transcription_status: 'completed',
        transcription_content: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', audioFileId)
      .select()
      .single();
    
    if (error) {
      console.error("Repository: Error updating transcription:", error);
      throw error;
    }
    
    console.log("Repository: Updated audio file:", audioFile);
    return audioFile;
  }

  async getAudioFileTranscriptions(audioFileId: string): Promise<any[]> {
    // Since there's no transcriptions table, we'll return the audio file itself
    // with its transcription content
    const { data: audioFile, error } = await this.supabase
      .from('audio_files')
      .select('id, transcription_content, updated_at, created_at')
      .eq('id', audioFileId)
      .single();

    if (error) throw error;
    // Return as an array with one item for compatibility
    return audioFile ? [audioFile] : [];
  }

  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
      });

    if (error) throw error;
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data: members, error } = await this.supabase
      .from('project_members')
      .select()
      .eq('project_id', projectId);

    if (error) throw error;
    return members;
  }

  subscribeToProjectChanges(projectId: string, onUpdate: (project: Project) => void): () => void {
    const subscription = this.supabase
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
    const subscription = this.supabase
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
    const { data: { session } } = await this.supabase.auth.getSession();
    
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

  async exportProjectDataset(projectId: string, includeProcessed: boolean = true): Promise<Blob> {
    try {
      // 1. Get project info
      const project = await this.getProjectById(projectId);
      if (!project) throw new Error('Project not found');
      const projectName = project.name.replace(/\s+/g, '_').toLowerCase();
      
      // 2. Get all audio files for the project
      const audioFiles = await this.getProjectAudioFiles(projectId);
      
      // 3. Filter audio files based on includeProcessed option
      const filesToExport = includeProcessed 
        ? audioFiles.filter(file => file.transcription_status === 'completed')
        : audioFiles;
      
      if (filesToExport.length === 0) {
        throw new Error('No files to export. Ensure files have completed transcriptions.');
      }
      
      // 4. Create a new JSZip instance
      const zip = new JSZip();
      
      // 5. Create the main folder with the project name
      const mainFolder = zip.folder(projectName);
      if (!mainFolder) throw new Error('Failed to create main folder in zip');
      
      // 6. Create the wav folder for audio files
      const wavFolder = mainFolder.folder('wav');
      if (!wavFolder) throw new Error('Failed to create wav folder in zip');
      
      // Track used filenames to handle duplicates
      const usedNames = new Set<string>();
      
      // 7. Create the line_index.tsv content
      let lineIndexContent = 'filename\ttranscription\n';
      
      // 8. Process each audio file
      const filePromises = filesToExport.map(async (file) => {
        try {
          // Get the audio file content - explicitly use raw version
          const audioUrl = await this.getAudioFileContent(file.id, false);
          
          // Download the file
          const response = await fetch(audioUrl);
          if (!response.ok) {
            throw new Error(`Failed to download file: ${file.file_name}`);
          }
          
          // Generate a safe filename
          const safeFileName = file.file_name
            .replace(/[^\w\s.-]/g, '') // Remove special characters except dots, hyphens
            .replace(/\s+/g, '_');     // Replace spaces with underscores
          
          // Handle duplicates by appending numbers
          let uniqueFileName = safeFileName;
          let counter = 1;
          while (usedNames.has(uniqueFileName.toLowerCase())) {
            const ext = safeFileName.split('.').pop() || 'wav';
            const baseName = safeFileName.slice(0, -(ext.length + 1));
            uniqueFileName = `${baseName}_${counter}.${ext}`;
            counter++;
          }
          
          // Add to used names set
          usedNames.add(uniqueFileName.toLowerCase());
          
          // Add the audio file to the wav folder
          const blob = await response.blob();
          wavFolder.file(uniqueFileName, blob);
          
          // Return the line for the index file if this file has transcription
          if (file.transcription_content) {
            return `${uniqueFileName}\t${file.transcription_content.trim()}\n`;
          }
          return '';
        } catch (error) {
          console.error(`Error processing file ${file.file_name}:`, error);
          // Return empty string for failed files
          return '';
        }
      });
      
      // Wait for all files to be processed and collect the line_index entries
      const lineIndexEntries = await Promise.all(filePromises);
      
      // Add all entries to the line_index.tsv content
      lineIndexContent += lineIndexEntries.filter(entry => entry !== '').join('');
      
      // Add the line_index.tsv file to the main folder
      mainFolder.file('line_index.tsv', lineIndexContent);
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      return zipBlob;
    } catch (error) {
      console.error('Error exporting project dataset:', error);
      throw error;
    }
  }
} 