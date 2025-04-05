from typing import Optional, List, Dict, Any
from abc import ABC, abstractmethod
from models.project import ProjectStatus, AudioFileStatus

class IProjectRepository(ABC):
    """Interface for project repository operations needed for audio processing"""
    
    @abstractmethod
    async def get_project_by_id(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Get project details by ID"""
        pass

    @abstractmethod
    async def update_project_status(self, project_id: str, user_id: str, status: ProjectStatus) -> None:
        """Update project status"""
        pass

    @abstractmethod
    async def update_project_progress(self, project_id: str, progress: int) -> None:
        """Update project progress"""
        pass

    @abstractmethod
    async def get_pending_audio_files(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all audio files with pending transcription status"""
        pass

    @abstractmethod
    async def update_audio_file_status(self, file_id: str, status: AudioFileStatus, error_message: Optional[str] = None) -> None:
        """Update audio file transcription status"""
        pass

    @abstractmethod
    async def update_audio_file_transcription(self, file_id: str, transcription: str, status: AudioFileStatus) -> None:
        """Update audio file transcription content and status"""
        pass

    @abstractmethod
    async def get_audio_file_content(self, file_path: str) -> bytes:
        """Get audio file content from storage"""
        pass

    @abstractmethod
    async def upload_audio_file(self, file_path: str, file_content: bytes, content_type: str) -> None:
        """Upload audio file to storage"""
        pass

    @abstractmethod
    async def update_audio_file_cleaned_path(self, file_id: str, cleaned_path: str) -> None:
        """Update the cleaned file path for an audio file"""
        pass 