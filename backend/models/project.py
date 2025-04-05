from pydantic import BaseModel
from enum import Enum
from typing import Optional

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class AudioFileStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProjectCreate(BaseModel):
    name: str
    description: str
    status: ProjectStatus = ProjectStatus.DRAFT
    progress: Optional[int] = 0
    total_files: Optional[int] = 0
    total_size: Optional[int] = 0
    total_duration: Optional[int] = 0
    dataset_path: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: str
    status: ProjectStatus
    progress: Optional[int]
    total_files: Optional[int]
    total_size: Optional[int]
    total_duration: Optional[int]
    dataset_path: Optional[str]
    created_at: str
    updated_at: str
    created_by: Optional[str]