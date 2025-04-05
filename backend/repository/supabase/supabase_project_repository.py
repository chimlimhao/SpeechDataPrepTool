from typing import List, Optional, Dict, Any
from supabase import create_client, Client
import os
from ..project_repository import IProjectRepository, ProjectStatus, AudioFileStatus
import logging

logger = logging.getLogger(__name__)

class SupabaseProjectRepository(IProjectRepository):
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )


    async def get_project_by_id(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Get project details by ID"""
        response = self.supabase.table("projects").select("*").eq("id", project_id).eq("created_by", user_id).execute()
        if not response.data:
            raise ValueError(f"Project not found with ID: {project_id}")
        return response.data[0]

    async def update_project_status(self, project_id: str, user_id: str, status: ProjectStatus) -> None:
        """Update project status"""
        # Convert status enum to string if needed
        status_value = status.value if hasattr(status, 'value') else status
        logger.info(f"Updating project {project_id} status to {status_value}")
        
        # Update exactly like the original code
        update_data = {"status": status_value}
        self.supabase.table("projects").update(update_data).eq("id", project_id).execute()
        
        logger.info(f"Project status updated successfully")

    async def update_project_progress(self, project_id: str, progress: int) -> None:
        """Update project progress"""
        logger.info(f"Updating project {project_id} progress to {progress}")
        self.supabase.table("projects").update({"progress": progress}).eq("id", project_id).execute()
        logger.info(f"Project progress updated successfully")

    async def get_pending_audio_files(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all audio files with pending transcription status"""
        response = self.supabase.table("audio_files").select("*").eq("project_id", project_id).eq("transcription_status", "pending").order("created_at", desc=True).execute()
        return response.data

    async def update_audio_file_status(self, file_id: str, status: AudioFileStatus, error_message: Optional[str] = None) -> None:
        """Update audio file transcription status"""
        # Convert status enum to string if needed
        status_value = status.value if hasattr(status, 'value') else status
        
        update_data = {"transcription_status": status_value}
        if error_message:
            update_data["error_message"] = error_message
            
        self.supabase.table("audio_files").update(update_data).eq("id", file_id).execute()

    async def update_audio_file_transcription(self, file_id: str, transcription: str, status: AudioFileStatus) -> None:
        """Update audio file transcription content and status"""
        # Convert status enum to string if needed
        status_value = status.value if hasattr(status, 'value') else status
        
        self.supabase.table("audio_files").update({
            "transcription_content": transcription,
            "transcription_status": status_value
        }).eq("id", file_id).execute()

    async def get_audio_file_content(self, file_path: str) -> bytes:
        """Get audio file content from storage"""
        return self.supabase.storage.from_("audio-files").download(file_path)

    async def upload_audio_file(self, file_path: str, file_content: bytes, content_type: str) -> None:
        """Upload audio file to storage"""
        self.supabase.storage.from_("audio-files").upload(
            file_path,
            file_content,
            {"content-type": content_type}
        )

    async def update_audio_file_cleaned_path(self, file_id: str, cleaned_path: str) -> None:
        """Update the cleaned file path for an audio file"""
        try:
            logger.info(f"Updating audio file {file_id} with cleaned path: {cleaned_path}")
            self.supabase.table("audio_files").update({
                "file_path_cleaned": cleaned_path
            }).eq("id", file_id).execute()
            logger.info("Audio file cleaned path updated successfully")
        except Exception as e:
            logger.error(f"Failed to update audio file cleaned path: {str(e)}")
            raise
