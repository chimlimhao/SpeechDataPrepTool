import { AuthService } from './auth.service';
import { ProjectService } from './project.service';
import { authRepository, projectRepository } from '@/repositories/supabase';

// Create service instances with their dependencies
export const authService = new AuthService(authRepository);
export const projectService = new ProjectService(projectRepository); 