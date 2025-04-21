"use client"
import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import type { Project, AudioFile, ProcessingLog } from "@/types/database.types";
import { SupabaseProjectRepositoryImpl } from "@/repositories/supabase/project_repo_impl";
import { supabase } from "@/lib/supabase/client";

export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, name?: string, description?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Promise<Project>;
  getUserProjects: () => Promise<Project[]>;
  addAudioFile: (projectId: string, file: File, duration?: number) => Promise<AudioFile>;
  getProjectAudioFiles: (projectId: string) => Promise<AudioFile[]>;
  getAudioFileContent: (fileId: string, useCleanedVersion: boolean) => Promise<string>;
  addTranscription: (audioFileId: string, content: string, language?: string, confidence?: number) => Promise<AudioFile>;
  triggerProjectProcessing: (projectId: string) => Promise<void>;
  exportProjectDataset: (projectId: string, includeProcessed?: boolean) => Promise<Blob>;
  subscribeToProjectChanges: (projectId: string, onUpdate: (project: Project) => void) => () => void;
  subscribeToAudioFileChanges: (
    projectId: string,
    callbacks: {
      onInsert?: (file: AudioFile) => void
      onDelete?: (fileId: string) => void
      onUpdate?: (file: AudioFile) => void
    }
  ) => () => void;
  clearAudioCache: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);


export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const projectRepository = useMemo(() => new SupabaseProjectRepositoryImpl(supabase), []);
  
  // Audio file URL cache
  const [audioUrlCache, setAudioUrlCache] = useState<Record<string, { url: string, timestamp: number }>>({});
  
  // Initialize cache from session storage
  useEffect(() => {
    try {
      const cachedData = sessionStorage.getItem('audioUrlCache');
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        setAudioUrlCache(parsedCache);
      }
    } catch (err) {
      console.error('Error loading audio cache from session storage:', err);
      // If there's an error, we just start with an empty cache
    }
  }, []);
  
  // Update session storage when cache changes
  useEffect(() => {
    if (Object.keys(audioUrlCache).length > 0) {
      try {
        sessionStorage.setItem('audioUrlCache', JSON.stringify(audioUrlCache));
      } catch (err) {
        console.error('Error saving audio cache to session storage:', err);
      }
    }
  }, [audioUrlCache]);

  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectRepository.createProject(name, description || '');
      setProjects(prev => [...prev, project]);
      return project;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, name?: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectRepository.updateProject(id, name || '', description || '');
      setProjects(prev => prev.map(p => p.id === id ? project : p));
      return project;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectRepository.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await projectRepository.getProjectById(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectRepository.getProjects();
      setProjects(projects);
      return projects;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addAudioFile = useCallback(async (projectId: string, file: File, duration?: number) => {
    try {
      setLoading(true);
      setError(null);
      const audioFile = await projectRepository.addAudioFile(projectId, file, duration);
      
      // Update projects state to reflect new file count and size
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            total_files: p.total_files + 1,
            total_size: p.total_size + file.size,
            total_duration: p.total_duration + (duration || 0),
          };
        }
        return p;
      }));

      return audioFile;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectAudioFiles = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await projectRepository.getProjectAudioFiles(projectId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAudioFileContent = useCallback(async (fileId: string, useCleanedVersion = false) => {
    try {
      // Check session storage first
      const cacheKey = `audio_${fileId}_${useCleanedVersion ? 'clean' : 'raw'}`;
      const cachedUrl = sessionStorage.getItem(cacheKey);
      if (cachedUrl) {
        console.log('Using cached audio URL from session storage');
        return cachedUrl;
      }

      // Get URL from repository
      const signedUrl = await projectRepository.getAudioFileContent(fileId, useCleanedVersion);

      // Cache the URL in session storage
      sessionStorage.setItem(cacheKey, signedUrl);

      return signedUrl;
    } catch (error) {
      console.error('Provider: Error getting audio file content:', error);
      setError(error as Error);
      throw error;
    }
  }, [projectRepository]);

  const addTranscription = useCallback(async (audioFileId: string, content: string, language?: string, confidence?: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Project Provider: Saving transcription for fileId:", audioFileId);
      const result = await projectRepository.addTranscription(audioFileId, content, language, confidence);
      console.log("Project Provider: Save result:", result);
      return result;
    } catch (err) {
      console.error("Project Provider: Error adding transcription:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectRepository]);

  const triggerProjectProcessing = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectRepository.triggerProjectProcessing(projectId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportProjectDataset = useCallback(async (projectId: string, includeProcessed = true) => {
    try {
      setLoading(true);
      setError(null);
      return await projectRepository.exportProjectDataset(projectId, includeProcessed);
    } catch (error) {
      console.error("Error exporting project dataset:", error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [projectRepository]);

  const subscribeToProjectChanges = useCallback((projectId: string, onUpdate: (project: Project) => void) => {
    return projectRepository.subscribeToProjectChanges(projectId, onUpdate);
  }, []);

  const subscribeToAudioFileChanges = useCallback((
    projectId: string,
    callbacks: {
      onInsert?: (file: AudioFile) => void
      onDelete?: (fileId: string) => void
      onUpdate?: (file: AudioFile) => void
    }
  ) => {
    return projectRepository.subscribeToAudioFileChanges(projectId, callbacks);
  }, []);

  // Method to manually clear the cache if needed
  const clearAudioCache = useCallback(() => {
    setAudioUrlCache({});
    try {
      sessionStorage.removeItem('audioUrlCache');
    } catch (err) {
      console.error('Error clearing audio cache from session storage:', err);
    }
  }, []);


  const value: ProjectContextType = {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById: async (id: string): Promise<Project> => {
      const project = await projectRepository.getProjectById(id);
      if (!project) throw new Error(`Project with id ${id} not found`);
      return project;
    },
    getUserProjects,
    addAudioFile,
    getProjectAudioFiles,
    getAudioFileContent,
    addTranscription,
    triggerProjectProcessing,
    exportProjectDataset,
    subscribeToProjectChanges,
    subscribeToAudioFileChanges,
    clearAudioCache,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 