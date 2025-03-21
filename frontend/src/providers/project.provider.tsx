"use client"
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project } from '@/types/database.types';
import { projectRepository } from '@/repositories/supabase';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, name?: string, description?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Promise<Project>;
  getUserProjects: () => Promise<Project[]>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

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

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        loading, 
        error, 
        createProject, 
        updateProject, 
        deleteProject,
        getProjectById,
        getUserProjects
      }}
    >
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