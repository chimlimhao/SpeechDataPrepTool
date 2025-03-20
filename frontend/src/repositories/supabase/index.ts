import { SupabaseAuthRepositoryImpl } from './auth_repo_impl';
import { SupabaseProjectRepositoryImpl } from './project_repo_impl';

// Export the current implementations
export const authRepository = new SupabaseAuthRepositoryImpl();
export const projectRepository = new SupabaseProjectRepositoryImpl(); 