import { SupabaseAuthRepositoryImpl } from './auth_repo_impl';
import { SupabaseProjectRepositoryImpl } from './project_repo_impl';
import { supabase } from '@/lib/supabase/client';

// Export the current implementations
export const authRepository = new SupabaseAuthRepositoryImpl();
export const projectRepository = new SupabaseProjectRepositoryImpl(supabase); 