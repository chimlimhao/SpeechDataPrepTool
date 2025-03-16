export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  total_files: number
  total_size: number
  total_duration: number
  dataset_path: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface AudioFile {
  id: string
  project_id: string
  file_name: string
  file_path: string
  file_size: number
  duration: number | null
  sample_rate: number | null
  channels: number | null
  bit_depth: number | null
  format: string | null
  transcription_status: ProcessingStatus
  transcription_content: string | null
  confidence: number | null
  error_message: string | null
  processing_started_at: string | null
  processing_completed_at: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface ProcessingLog {
  id: string
  audio_file_id: string
  operation: string
  status: ProcessingStatus
  message: string | null
  started_at: string
  completed_at: string | null
  created_by: string
}

export interface ProjectMember {
  project_id: string
  user_id: string
  role: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'total_files' | 'total_size' | 'total_duration'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'total_files' | 'total_size' | 'total_duration'>>
      }
      audio_files: {
        Row: AudioFile
        Insert: Omit<AudioFile, 'id' | 'created_at' | 'updated_at' | 'processing_started_at' | 'processing_completed_at'>
        Update: Partial<Omit<AudioFile, 'id' | 'created_at' | 'updated_at'>>
      }
      processing_logs: {
        Row: ProcessingLog
        Insert: Omit<ProcessingLog, 'id' | 'started_at' | 'completed_at'>
        Update: Partial<Omit<ProcessingLog, 'id' | 'started_at'>>
      }
      project_members: {
        Row: ProjectMember
        Insert: Omit<ProjectMember, 'created_at'>
        Update: Partial<Omit<ProjectMember, 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: ProjectStatus
      processing_status: ProcessingStatus
    }
  }
} 