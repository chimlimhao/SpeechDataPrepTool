"use client"
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Project, AudioFile } from "@/types/database.types";
import { SupabaseProjectRepositoryImpl } from "@/repositories/supabase/project_repo_impl";

interface ProjectContextType {
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
  triggerProjectProcessing: (projectId: string) => Promise<void>;
  subscribeToProjectChanges: (projectId: string, onUpdate: (project: Project) => void) => () => void;
  subscribeToAudioFileChanges: (
    projectId: string,
    callbacks: {
      onInsert?: (file: AudioFile) => void
      onDelete?: (fileId: string) => void
      onUpdate?: (file: AudioFile) => void
    }
  ) => () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const projectRepository = new SupabaseProjectRepositoryImpl();

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectRepository.createProject(name, description);
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
      const project = await projectRepository.updateProject(id, name, description);
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

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getUserProjects,
    addAudioFile,
    getProjectAudioFiles,
    triggerProjectProcessing,
    subscribeToProjectChanges,
    subscribeToAudioFileChanges,
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