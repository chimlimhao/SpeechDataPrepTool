from typing import Dict, Any, Optional, List
import logging
from pathlib import Path
import tempfile
import soundfile as sf
import numpy as np
import torch
from df.enhance import enhance, init_df
import base64
import requests
import os
import shutil
from repository.project_repository import ProjectStatus, AudioFileStatus, IProjectRepository

logger = logging.getLogger(__name__)

class ProjectService:
    def __init__(self, repository: IProjectRepository):
        self.repository = repository
        self.asr_service_url = os.getenv("ASR_SERVICE_URL", "http://localhost:8000")
        logger.info(f"Using ASR service URL: {self.asr_service_url}")
        
        # Define fixed paths relative to backend directory
        backend_dir = Path(__file__).parent.parent  # Get backend directory path
        self.raw_path = backend_dir / "temp-folder" / "raw"
        self.cleaned_path = backend_dir / "temp-folder" / "cleaned"
        
        # Create directories if they don't exist
        self.raw_path.mkdir(parents=True, exist_ok=True)
        self.cleaned_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Using raw path: {self.raw_path}")
        logger.info(f"Using cleaned path: {self.cleaned_path}")
        
        # Initialize DeepFilterNet once
        import subprocess
        logger.info("Initializing DeepFilterNet...")
        try:
            result = subprocess.run(
                ["deepFilter", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"DeepFilterNet initialized: {result.stdout}")
        except Exception as e:
            logger.error(f"Failed to initialize DeepFilterNet: {str(e)}")

    async def process_project(self, project_id: str, user_id: str):
        """Process a project's audio files"""
        try:
            logger.info(f"Starting processing for project {project_id} by user {user_id}")
            
            # Verify project ownership and set initial state
            project = await self._initialize_project(project_id, user_id)
            
            # Process audio files
            result = await self._process_project_audio_files(project_id, user_id)
            
            # Update final project status
            await self._finalize_project(project_id, user_id, result)
            
            return {
                "message": "Processing completed",
                "total_files": result["total_files"],
                "processed_files": result["processed_count"],
                "status": result["final_status"]
            }
        except Exception as e:
            logger.error(f"Error processing project: {str(e)}")
            # Update project status to ARCHIVED if there's an error
            try:
                await self.repository.update_project_status(project_id, user_id, ProjectStatus.ARCHIVED)
            except Exception as status_error:
                logger.error(f"Failed to update project status after error: {str(status_error)}")
            raise e

    async def _initialize_project(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Verify project ownership and set initial state"""
        # Verify project ownership
        project = await self.repository.get_project_by_id(project_id, user_id)
        
        # Log current project status
        logger.info(f"Current project status: {project.get('status')}")
        
        # Update project status to IN_PROGRESS
        await self.repository.update_project_status(project_id, user_id, ProjectStatus.IN_PROGRESS)
        
        return project

    async def _process_project_audio_files(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Process all pending audio files for a project"""
        # Fetch pending audio files for this project
        pending_files = await self.repository.get_pending_audio_files(project_id)
        logger.info(f"Found {len(pending_files)} pending files to process")
        
        # Process each audio file
        processed_count = 0
        for i, audio_file in enumerate(pending_files):
            file_id = audio_file["id"]
            file_path = audio_file["file_path_raw"]
            
            logger.info(f"[{i+1}/{len(pending_files)}] Processing file {file_id}, path: {file_path}")
            
            # Process the file
            processed = await self._handle_audio_file(file_id, file_path)
            if processed:
                processed_count += 1
            
            # Update project progress after each file
            await self._update_progress(project_id, i, len(pending_files))
        
        # Determine final status
        final_status = ProjectStatus.COMPLETED if processed_count == len(pending_files) else ProjectStatus.ARCHIVED
        
        return {
            "total_files": len(pending_files),
            "processed_count": processed_count,
            "final_status": final_status
        }

    async def _update_progress(self, project_id: str, processed_index: int, total_files: int) -> None:
        """Update project progress percentage"""
        progress = int((processed_index + 1) / total_files * 100) if total_files > 0 else 100
        await self.repository.update_project_progress(project_id, progress)
        logger.info(f"Updated project progress to {progress}%")

    async def _finalize_project(self, project_id: str, user_id: str, result: Dict[str, Any]) -> None:
        """Update final project status and progress"""
        final_status = result["final_status"]
        
        await self.repository.update_project_status(project_id, user_id, final_status)
        if final_status == ProjectStatus.COMPLETED:
            await self.repository.update_project_progress(project_id, 100)
        
        logger.info(f"Processing completed with status: {final_status}")

    async def _handle_audio_file(self, file_id: str, file_path: str) -> bool:
        """Process a single audio file and handle exceptions"""
        try:
            # Update file status to PROCESSING
            await self.repository.update_audio_file_status(file_id, AudioFileStatus.PROCESSING)
            
            # Process the audio file (noise reduction + transcription)
            success = await self._process_audio_file(file_id, file_path)
            return success
        except Exception as e:
            logger.error(f"Error processing file {file_id}: {str(e)}")
            await self.repository.update_audio_file_status(file_id, AudioFileStatus.FAILED, str(e))
            return False

    async def _process_audio_file(self, file_id: str, file_path: str) -> bool:
        """Process a single audio file with noise reduction and transcription"""
        raw_file_path = None
        cleaned_file_path = None
        
        try:
            # Extract original filename from the storage path
            # Example path: project_id/timestamp-converted/original_name.wav
            path_parts = file_path.split('/')
            original_filename = path_parts[-1]  # Get the last part of the path
            
            # 1. Download and save to raw directory
            file_data = await self.repository.get_audio_file_content(file_path)
            logger.info(f"Downloaded file size: {len(file_data)} bytes")
            
            # Use original filename with file_id prefix for uniqueness
            raw_file_path = self.raw_path / f"{file_id}_{original_filename}"
            with open(raw_file_path, "wb") as f:
                f.write(file_data)
            logger.info(f"Saved raw file to: {raw_file_path}")
            
            # 2. Apply noise reduction and save to cleaned directory
            # Add _cleaned suffix before the extension
            filename_parts = original_filename.rsplit('.', 1)
            cleaned_filename = f"{filename_parts[0]}_cleaned.{filename_parts[1]}"
            cleaned_file_path = self.cleaned_path / f"{file_id}_{cleaned_filename}"
            
            noise_reduction_success = await self._clean_audio(raw_file_path, cleaned_file_path)
            
            if not noise_reduction_success:
                logger.warning(f"Noise reduction failed, using original audio")
                # Copy the raw file to the cleaned path if noise reduction fails
                shutil.copy(raw_file_path, cleaned_file_path)
            
            # 3. Upload cleaned file to storage and update database
            cleaned_storage_path = self._generate_cleaned_storage_path(file_path, original_filename)
            with open(cleaned_file_path, "rb") as f:
                cleaned_audio_data = f.read()
            
            logger.info(f"Uploading cleaned file to storage at path: {cleaned_storage_path}")
            await self.repository.upload_audio_file(
                cleaned_storage_path,
                cleaned_audio_data,
                "audio/wav"
            )
            
            # Update the audio file record with the cleaned file path
            await self.repository.update_audio_file_cleaned_path(file_id, cleaned_storage_path)
            logger.info(f"Updated audio file record with cleaned path: {cleaned_storage_path}")
            
            # 4. Get transcription from cleaned audio and update record
            transcription = await self._get_transcription(cleaned_file_path)
            await self.repository.update_audio_file_transcription(
                file_id, 
                transcription,
                AudioFileStatus.COMPLETED
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error in _process_audio_file: {str(e)}")
            raise
            
        finally:
            # Cleanup temp files
            if raw_file_path and raw_file_path.exists():
                raw_file_path.unlink()
                logger.info(f"Cleaned up raw file: {raw_file_path}")
            if cleaned_file_path and cleaned_file_path.exists():
                cleaned_file_path.unlink()
                logger.info(f"Cleaned up cleaned file: {cleaned_file_path}")

    def _generate_cleaned_storage_path(self, original_file_path: str, original_filename: str) -> str:
        """Generate storage path for cleaned audio file"""
        # Split the path into parts
        path_parts = original_file_path.split('/')
        
        # Get the project_id and directory structure
        if len(path_parts) >= 2:
            # Split filename and add _cleaned before extension
            filename_parts = original_filename.rsplit('.', 1)
            cleaned_filename = f"{filename_parts[0]}_cleaned.{filename_parts[1]}"
            
            # Keep the same directory structure but with cleaned filename
            path_parts[-1] = cleaned_filename
            return '/'.join(path_parts)
        else:
            # Fallback if path structure is unexpected
            filename_parts = original_filename.rsplit('.', 1)
            return f"{filename_parts[0]}_cleaned.{filename_parts[1]}"

    async def _clean_audio(self, input_file_path: Path, output_file_path: Path) -> bool:
        """Apply noise reduction to audio file using DeepFilterNet command-line tool"""
        try:
            logger.info(f"Applying noise reduction using deepFilter command: {input_file_path}")
            
            # Get the output directory and ensure it exists
            output_dir = output_file_path.parent
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Log input file size for verification
            input_size = input_file_path.stat().st_size
            logger.info(f"Input file size: {input_size} bytes")
            
            # Run deepFilter command to output directory
            import subprocess
            command = f"deepfilter {input_file_path} -o {output_dir}"
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Noise reduction command completed: {result.stdout}")
            
            # DeepFilterNet will create a file with _DeepFilterNet3 suffix
            filename = input_file_path.stem
            extension = input_file_path.suffix
            deepfilter_output = output_dir / f"{filename}_DeepFilterNet3{extension}"
            
            # Verify the output file exists
            if deepfilter_output.exists() and deepfilter_output.is_file():
                output_size = deepfilter_output.stat().st_size
                logger.info(f"DeepFilterNet output file size: {output_size} bytes")
                
                if output_size == 0:
                    logger.error("DeepFilterNet output file is empty")
                    return False
                
                # Rename to our desired cleaned filename
                if output_file_path.exists():
                    output_file_path.unlink()
                deepfilter_output.rename(output_file_path)
                logger.info(f"Renamed cleaned file to: {output_file_path}")
                
                return True
            else:
                logger.error(f"DeepFilterNet failed to create output file: {deepfilter_output}")
                return False

        except subprocess.CalledProcessError as e:
            logger.error(f"DeepFilterNet command failed: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Error in noise reduction: {str(e)}")
            return False

    async def _get_transcription(self, audio_file_path: Path) -> str:
        """Get transcription from ASR service"""
        try:
            # Prepare audio data
            audio_base64 = await self._prepare_audio_for_transcription(audio_file_path)
            
            # Send to ASR service and handle response
            return await self._send_to_asr_service(audio_file_path.name, audio_base64)
            
        except Exception as e:
            logger.error(f"Error getting transcription: {str(e)}")
            raise Exception(f"Transcription failed: {str(e)}")

    async def _prepare_audio_for_transcription(self, audio_file_path: Path) -> str:
        """Read audio file and convert to base64"""
        with open(audio_file_path, "rb") as f:
            audio_bytes = f.read()
            return base64.b64encode(audio_bytes).decode('utf-8')

    async def _send_to_asr_service(self, filename: str, audio_base64: str) -> str:
        """Send audio to ASR service and process response"""
        response = requests.post(
            f"{self.asr_service_url}/transcribe",
            json={
                "audio_bytes": audio_base64,
                "filename": filename
            },
            timeout=60  # One minute timeout
        )
        
        if response.status_code != 200:
            raise Exception(f"ASR service error: {response.text}")
        
        transcription_result = response.json()
        return transcription_result["transcription"] 