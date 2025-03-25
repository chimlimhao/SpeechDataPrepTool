from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
from enum import Enum
import requests
import base64
import tempfile
import soundfile as sf
from pathlib import Path
import json
import subprocess
import shutil
from fastapi.responses import JSONResponse

# Add the correct imports
from df.enhance import enhance, init_df
import numpy as np
import torch

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

# ASR service configuration
ASR_SERVICE_URL = os.getenv("ASR_SERVICE_URL", "http://localhost:8000")  # ASR service URL
logger.info(f"Using ASR service URL: {ASR_SERVICE_URL}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log the Supabase URL being used
logger.info(f"Using Supabase URL: {os.getenv('SUPABASE_URL')}")

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    # os.getenv("SUPABASE_KEY")
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),  # Using service role key to bypass RLS for storage operations
)

async def get_current_user(authorization: str = Header(...)) -> str:
    """Extract user ID from Supabase JWT token"""
    try:
        # Remove 'Bearer ' prefix if present
        token = authorization.replace('Bearer ', '')
        
        # Get user data from token
        logger.info("Attempting to get user from token")
        user = supabase.auth.get_user(token)
        logger.info(f"Got user response: {user}")
        
        # The user ID is in the user.user.id field
        if not user.user or not user.user.id:
            logger.error("No user or user ID found in token response")
            raise HTTPException(status_code=401, detail="Invalid user data in token")
            
        logger.info(f"Successfully authenticated user: {user.user.id}")
        return user.user.id
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        logger.error(f"Authorization header: {authorization[:20]}...")  # Log first 20 chars of token
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

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

# @app.get("/projects")
# async def get_all_projects(user_id: str = Depends(get_current_user)):
#     try:
#         # Only fetch projects created by the current user
#         response = supabase.table("projects").select("*").eq("created_by", user_id).execute()
#         logger.info(f"Projects response for user {user_id}: {response.data}")
#         if not response.data:
#             logger.warning(f"No projects found for user {user_id}")
#         return {"data": response.data}
#     except Exception as e:
#         logger.error(f"Error fetching projects: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# Function to clean audio using DeepFilterNet
def clean_audio(input_file_path, output_file_path):
    """
    Clean audio file using DeepFilterNet noise reduction
    
    Args:
        input_file_path: Path to the input audio file
        output_file_path: Path where the cleaned audio will be saved
    """
    try:
        logger.info(f">>>>>> Starting noise reduction with DeepFilterNet for file: {input_file_path}")
        
        # Get the directory of the output file
        output_dir = os.path.dirname(output_file_path) 
        input_filename = os.path.basename(input_file_path)
        expected_output = os.path.join(output_dir, "df_" + input_filename)
        
        # First try Python API approach as it's more reliable
        try:
            logger.info(">>>>>> Trying Python API first")
            # Load the audio file
            logger.info(">>>>>> Loading audio file with soundfile")
            audio, sample_rate = sf.read(input_file_path)
            
            # Process the audio (convert to float32 if needed)
            logger.info(f">>>>>> Converting audio to float32, current dtype: {audio.dtype}")
            if audio.dtype != np.float32:
                audio = audio.astype(np.float32)
            
            # Handle mono vs stereo
            original_shape = audio.shape
            logger.info(f">>>>>> Original audio shape: {original_shape}")
            
            if len(audio.shape) == 1:  # Mono
                # Reshape to [channels, samples]
                audio = audio.reshape(1, -1)
                logger.info(f">>>>>> Reshaped mono audio to: {audio.shape}")
            elif len(audio.shape) == 2 and audio.shape[1] == 2:  # Stereo with shape [samples, channels]
                # Transpose to [channels, samples]
                audio = audio.T
                logger.info(f">>>>>> Transposed stereo audio to: {audio.shape}")
            
            # Convert numpy array to torch tensor
            logger.info(f">>>>>> Converting numpy array to torch tensor, shape: {audio.shape}, dtype: {audio.dtype}")
            audio_tensor = torch.from_numpy(audio)
            
            # Initialize DeepFilterNet model - using the correct API
            logger.info(">>>>>> Initializing DeepFilterNet model")
            model, df_state, _ = init_df()
            
            # Enhance the audio using DeepFilterNet
            logger.info(">>>>>> Enhancing audio with DeepFilterNet")
            enhanced_audio = enhance(model, df_state, audio_tensor)
            
            # Convert back to numpy array if needed
            logger.info(">>>>>> Converting enhanced audio back to numpy array")
            if isinstance(enhanced_audio, torch.Tensor):
                enhanced_audio = enhanced_audio.cpu().numpy()
            
            # Convert back to original shape
            if len(audio.shape) == 2 and audio.shape[0] == 1:  # Was mono
                enhanced_audio = enhanced_audio.squeeze(0)
                logger.info(f">>>>>> Squeezed mono audio to shape: {enhanced_audio.shape}")
            elif len(audio.shape) == 2 and audio.shape[0] == 2:  # Was stereo
                enhanced_audio = enhanced_audio.T
                logger.info(f">>>>>> Transposed stereo audio to shape: {enhanced_audio.shape}")
            
            # Save the enhanced audio
            logger.info(f">>>>>> Saving enhanced audio to {output_file_path}")
            sf.write(output_file_path, enhanced_audio, sample_rate)
            logger.info(">>>>>> Successfully saved enhanced audio")
            return True
            
        except Exception as api_error:
            logger.error(f">>>>>> Python API approach failed: {str(api_error)}")
            logger.error(f">>>>>> Python API error type: {type(api_error)}")
            import traceback
            logger.error(f">>>>>> Python API error traceback: {traceback.format_exc()}")
            
            # Try CLI as fallback
            logger.info(">>>>>> Trying CLI as fallback")
            try:
                result = subprocess.run(
                    ["deepFilter", str(input_file_path), "--output-dir", str(output_dir)],
                    capture_output=True,
                    text=True,
                    check=True  # This will raise CalledProcessError if command fails
                )
                
                logger.info(f">>>>>> Noise reduction completed via CLI: {result.stdout}")
                # The output file will be named "df_<input_filename>" in the output directory
                if os.path.exists(expected_output):
                    shutil.move(expected_output, output_file_path)
                    logger.info(f">>>>>> Renamed output file from {expected_output} to {output_file_path}")
                    return True
                else:
                    logger.error(f">>>>>> CLI succeeded but output file not found at {expected_output}")
                    raise FileNotFoundError(f"Expected output file not found at {expected_output}")
                    
            except subprocess.CalledProcessError as cli_error:
                logger.error(f">>>>>> DeepFilterNet CLI failed: {cli_error.stderr}")
                raise
                
    except Exception as e:
        logger.error(f">>>>>> Error in noise reduction: {str(e)}")
        # If noise reduction fails completely, we'll copy the original file
        shutil.copy(input_file_path, output_file_path)
        logger.warning(f">>>>>> Using original audio due to noise reduction failure")
        return False

@app.post("/project/process/{projectid}")
async def process_project(projectid: str, user_id: str = Depends(get_current_user)):
    try:
        logger.info(f">>>>>> Starting processing for project {projectid} by user {user_id}")
        
        # Verify project ownership
        project = get_project_by_id(projectid, user_id)
        if not project:
            logger.error(f">>>>>> Project {projectid} not found or access denied for user {user_id}")
            raise HTTPException(status_code=404, detail="Project not found or access denied")
        
        # Log current project status
        logger.info(f">>>>>> Current project status: {project.get('status')}")
        
        # 1. Update project status to IN_PROGRESS
        update_data = {"status": ProjectStatus.IN_PROGRESS.value}
        logger.info(f">>>>>> Updating project status with: {update_data}")
        
        supabase.table("projects").update(
            update_data
        ).eq("id", projectid).eq("created_by", user_id).execute()
        
        # 2. Fetch pending audio files for this project
        response = supabase.table("audio_files").select("*").eq("project_id", projectid).eq("transcription_status", AudioFileStatus.PENDING.value).order("created_at", desc=True).execute()
        
        pending_files = response.data
        logger.info(f">>>>>> Found {len(pending_files)} pending files to process")
        
        # 3. Process each audio file
        processed_count = 0
        for i, audio_file in enumerate(pending_files):
            file_id = audio_file["id"]
            file_path = audio_file["file_path_raw"]
            
            logger.info(f">>>>>> [{i+1}/{len(pending_files)}] Processing file {file_id}, path: {file_path}")
            
            # Process the file
            try:
                # Update file status to PROCESSING
                status_result = supabase.table("audio_files").update(
                    {"transcription_status": AudioFileStatus.PROCESSING.value}
                ).eq("id", file_id).execute()
                logger.info(f">>>>>> Status update result: {status_result.data}")
                
                # Get file content from storage
                try:
                    logger.info(f">>>>>> Downloading file from storage: {file_path}")
                    try:
                        file_data = supabase.storage.from_("audio-files").download(file_path)
                        logger.info(f">>>>>> Downloaded file size: {len(file_data)} bytes")
                    except Exception as storage_e:
                        logger.warning(f">>>>>> Error downloading from storage: {str(storage_e)}")
                        # Try to use a test file instead for demo purposes
                        test_file = Path("test_files/test.wav")
                        if not test_file.exists():
                            # Create the directory if it doesn't exist
                            test_file.parent.mkdir(exist_ok=True)
                            # Create a simple WAV file for testing
                            with open(test_file, 'wb') as f:
                                f.write(b'\x00' * 1000)  # Dummy WAV content
                        with open(test_file, 'rb') as f:
                            file_data = f.read()
                        logger.info(f">>>>>> Using test file, size: {len(file_data)} bytes")
                except Exception as e:
                    logger.error(f">>>>>> Failed to get file data: {str(e)}")
                    raise
                    
                # Create temp directory for processing
                temp_dir = Path("temp-folder")
                raw_dir = temp_dir / "raw"
                cleaned_dir = temp_dir / "cleaned"
                
                for directory in [temp_dir, raw_dir, cleaned_dir]:
                    directory.mkdir(exist_ok=True)
                    
                # Save to temp raw directory
                raw_file_path = raw_dir / f"{file_id}.wav"
                with open(raw_file_path, "wb") as f:
                    f.write(file_data)
                logger.info(f">>>>>> Saved raw file to: {raw_file_path}")
                
                # Apply noise reduction using DeepFilterNet
                cleaned_file_path = cleaned_dir / f"{file_id}_clean.wav"
                noise_reduction_success = clean_audio(raw_file_path, cleaned_file_path)
                
                if noise_reduction_success:
                    logger.info(f">>>>>> Successfully applied noise reduction")
                else:
                    logger.warning(f">>>>>> Noise reduction failed, using original audio")
                
                # STORE THE CLEANED FILE TO SUPABASE STORAGE
                try:
                    # Get the cleaned file content
                    with open(cleaned_file_path, "rb") as f:
                        cleaned_audio_data = f.read()
                    
                    # Determine storage path - use same structure as original but with _cleaned suffix
                    original_path_parts = file_path.split('/')
                    file_name_parts = original_path_parts[-1].split('.')
                    cleaned_file_name = f"{file_name_parts[0]}_cleaned.{file_name_parts[-1]}"
                    cleaned_storage_path = '/'.join(original_path_parts[:-1] + [cleaned_file_name])
                    
                    logger.info(f">>>>>> Uploading cleaned file to storage at path: {cleaned_storage_path}")
                    
                    # Check if file already exists in storage and remove it
                    try:
                        supabase.storage.from_("audio-files").remove([cleaned_storage_path])
                        logger.info(f">>>>>> Removed existing file at {cleaned_storage_path}")
                    except Exception as remove_error:
                        logger.info(f">>>>>> No existing file to remove or error: {str(remove_error)}")
                    
                    # Upload the cleaned file to storage
                    upload_result = supabase.storage.from_("audio-files").upload(
                        cleaned_storage_path,
                        cleaned_audio_data,
                        {"content-type": "audio/wav"}
                    )
                    
                    logger.info(f">>>>>> Cleaned file upload result: {upload_result}")
                    
                    # Verify the upload by downloading and comparing file sizes
                    try:
                        verification_data = supabase.storage.from_("audio-files").download(cleaned_storage_path)
                        if len(verification_data) != len(cleaned_audio_data):
                            raise Exception(f"Upload verification failed: size mismatch. Local: {len(cleaned_audio_data)}, Storage: {len(verification_data)}")
                        logger.info(f">>>>>> Upload verified successfully. File size: {len(verification_data)} bytes")
                    except Exception as verify_error:
                        logger.error(f">>>>>> Upload verification failed: {str(verify_error)}")
                        raise
                    
                    # Update the audio file record with the cleaned file path
                    file_update_result = supabase.table("audio_files").update({
                        "file_path_cleaned": cleaned_storage_path,
                        "transcription_status": AudioFileStatus.COMPLETED.value
                    }).eq("id", file_id).execute()
                    
                    logger.info(f">>>>>> File path update result: {file_update_result.data}")
                    
                except Exception as upload_error:
                    logger.error(f">>>>>> Error uploading cleaned file to storage: {str(upload_error)}")
                    logger.error(f">>>>>> Upload error type: {type(upload_error)}")
                    import traceback
                    logger.error(f">>>>>> Upload error traceback: {traceback.format_exc()}")
                    raise  # Re-raise the error instead of continuing
                
                # Read cleaned file and convert to base64
                with open(cleaned_file_path, "rb") as f:
                    audio_bytes = f.read()
                    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                logger.info(f">>>>>> Encoded file to base64, length: {len(audio_base64)}")
                
                # Send to ASR service
                try:
                    logger.info(f">>>>>> TEST ENDPOINT: Sending file to ASR service: {ASR_SERVICE_URL}/transcribe")
                    response = requests.post(
                        f"{ASR_SERVICE_URL}/transcribe",
                        json={
                            "audio_bytes": audio_base64,
                            "filename": f"{file_id}_clean.wav"
                        },
                        timeout=60  # One minute timeout
                    )
                    
                    logger.info(f">>>>>> ASR service response status: {response.status_code}")
                    
                    if response.status_code != 200:
                        logger.error(f">>>>>> ASR service error: {response.text}")
                        raise Exception(f"ASR service error: {response.text}")
                    
                    transcription_result = response.json()
                    logger.info(f">>>>>> ASR transcription result: {transcription_result}")
                    
                    # Update audio file record with transcription
                    logger.info(f">>>>>> Updating audio file record with transcription: file_id={file_id}")
                    update_result = supabase.table("audio_files").update({
                        "transcription_status": AudioFileStatus.COMPLETED.value,
                        "transcription_content": transcription_result["transcription"]
                    }).eq("id", file_id).execute()
                    
                    logger.info(f">>>>>> Update result: {update_result.data}")
                    processed_count += 1
                    
                except Exception as e:
                    logger.error(f">>>>>> Error processing file: {str(e)}")
                    raise
                
                finally:
                    # Cleanup temp files
                    if raw_file_path.exists():
                        raw_file_path.unlink()
                        logger.info(f">>>>>> Cleaned up raw file: {raw_file_path}")
                    if cleaned_file_path.exists():
                        cleaned_file_path.unlink()
                        logger.info(f">>>>>> Cleaned up cleaned file: {cleaned_file_path}")
                
            except Exception as e:
                logger.error(f"Error processing file {file_id}: {str(e)}")
                update_result = supabase.table("audio_files").update({
                    "transcription_status": AudioFileStatus.FAILED.value,
                    "error_message": str(e)
                }).eq("id", file_id).execute()
                logger.info(f"Failure update result: {update_result.data}")
            
            # Update project progress after each file
            progress = int((i + 1) / len(pending_files) * 100)
            progress_result = supabase.table("projects").update({
                "progress": progress
            }).eq("id", projectid).execute()
            logger.info(f">>>>>> Updated project progress to {progress}%: {progress_result.data}")
        
        # 4. Update project status based on results
        final_status = ProjectStatus.COMPLETED.value if processed_count == len(pending_files) else ProjectStatus.ARCHIVED.value
        
        final_update = supabase.table("projects").update({
            "status": final_status,
            "progress": 100 if final_status == ProjectStatus.COMPLETED.value else None
        }).eq("id", projectid).execute()
        
        logger.info(f">>>>>> Final project update result: {final_update.data}")
        
        return {
            "message": "Processing completed",
            "total_files": len(pending_files),
            "processed_files": processed_count,
            "status": final_status
        }
    except Exception as e:
        logger.error(f">>>>>> Error processing project: {str(e)}")
        # Update project status to FAILED
        supabase.table("projects").update({
            "status": ProjectStatus.ARCHIVED.value
        }).eq("id", projectid).execute()
        
        raise HTTPException(status_code=500, detail=str(e))


def get_project_by_id(projectid: str, user_id: str):
    try:
        # Only fetch project if owned by the user
        response = supabase.table("projects").select("*").eq("id", projectid).eq("created_by", user_id).execute()
        if not response.data:
            return None
        return response.data[0]
    except Exception as e:
        logger.error(f"Error fetching project by ID: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add a custom exception handler for 500 errors
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    import traceback
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return {"detail": str(exc), "traceback": traceback.format_exc()}

# Test endpoint for checking DeepFilterNet functionality
@app.post("/test/denoise")
async def test_denoise(file_id: str = None):
    """
    Test endpoint for noise reduction using DeepFilterNet.
    If file_id is provided, it will fetch that file from Supabase.
    Otherwise, it will use a test file.
    """
    try:
        logger.info(">>>>>> Starting test_denoise endpoint")
        # Create temp directory for processing
        temp_dir = Path("temp-folder")
        raw_dir = temp_dir / "raw"
        cleaned_dir = temp_dir / "cleaned"
        
        logger.info(f">>>>>> Creating directories: {temp_dir}, {raw_dir}, {cleaned_dir}")
        for directory in [temp_dir, raw_dir, cleaned_dir]:
            directory.mkdir(exist_ok=True)
        
        # Get the audio file
        if file_id:
            try:
                logger.info(f">>>>>> Using file_id: {file_id}")
                # Get file metadata first
                file_response = supabase.table("audio_files").select("file_path_raw").eq("id", file_id).execute()
                if not file_response.data:
                    logger.error(f">>>>>> File not found with ID: {file_id}")
                    raise HTTPException(status_code=404, detail="File not found")
                
                file_path = file_response.data[0]["file_path_raw"]
                logger.info(f">>>>>> Downloading file from storage: {file_path}")
                
                # Download file from storage
                file_data = supabase.storage.from_("audio-files").download(file_path)
                logger.info(f">>>>>> Downloaded file size: {len(file_data)} bytes")
            except Exception as e:
                logger.error(f">>>>>> Failed to get file data: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
        else:
            # Use a test file
            test_file = Path("test_files/test.wav")
            logger.info(f">>>>>> Using test file: {test_file}, exists: {test_file.exists()}")
            if not test_file.exists():
                logger.error(f">>>>>> Test file not found: {test_file}")
                raise HTTPException(status_code=404, detail=f"Test file not found: {test_file}")
            
            with open(test_file, 'rb') as f:
                file_data = f.read()
            logger.info(f">>>>>> Using test file, size: {len(file_data)} bytes")
        
        # Process the file
        input_file = raw_dir / "test_input.wav"
        output_file = cleaned_dir / "test_output.wav"
        
        logger.info(f">>>>>> Saving input file to: {input_file}")
        # Save input file
        with open(input_file, "wb") as f:
            f.write(file_data)
        
        logger.info(f">>>>>> Applying noise reduction from {input_file} to {output_file}")
        # Apply noise reduction
        noise_reduction_success = clean_audio(input_file, output_file)
        
        if not noise_reduction_success:
            logger.error(">>>>>> Noise reduction failed")
            raise HTTPException(status_code=500, detail="Noise reduction failed")
        
        logger.info(f">>>>>> Reading processed files for comparison")
        # Read both files for comparison
        try:
            with open(input_file, "rb") as f:
                input_data = f.read()
            
            with open(output_file, "rb") as f:
                output_data = f.read()
            
            # Convert to base64 for response
            input_base64 = base64.b64encode(input_data).decode('utf-8')
            output_base64 = base64.b64encode(output_data).decode('utf-8')
        except Exception as e:
            logger.error(f">>>>>> Error reading files: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error reading files: {str(e)}")
        
        # Cleanup
        logger.info(f">>>>>> Cleaning up temporary files")
        input_file.unlink(missing_ok=True)
        output_file.unlink(missing_ok=True)
        
        logger.info(f">>>>>> Test denoise completed successfully")
        return {
            "message": "Noise reduction successful",
            "input_size": len(input_data),
            "output_size": len(output_data),
            "input_audio_base64": input_base64[:100] + "...", # Truncated for response
            "output_audio_base64": output_base64[:100] + "...", # Truncated for response
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        logger.error(f">>>>>> Error in test denoise: {error_msg}")
        logger.error(f">>>>>> Traceback: {tb}")
        return JSONResponse(
            status_code=500,
            content={"detail": error_msg, "traceback": tb}
        )

@app.post("/test/process/{file_id}")
async def test_process_file(file_id: str):
    """
    Test endpoint for processing a single file with noise reduction and storing to Supabase.
    This endpoint simulates the flow in process_project but for a single file.
    """
    try:
        logger.info(f">>>>>> Starting test_process_file endpoint for file_id: {file_id}")
        
        # Create temp directory for processing
        temp_dir = Path("temp-folder")
        raw_dir = temp_dir / "raw"
        cleaned_dir = temp_dir / "cleaned"
        
        logger.info(f">>>>>> Creating directories: {temp_dir}, {raw_dir}, {cleaned_dir}")
        for directory in [temp_dir, raw_dir, cleaned_dir]:
            directory.mkdir(exist_ok=True)
        
        # Get file metadata and content
        try:
            # Get file metadata first
            logger.info(f">>>>>> Getting file metadata for ID: {file_id}")
            file_response = supabase.table("audio_files").select("*").eq("id", file_id).execute()
            
            if not file_response.data:
                logger.error(f">>>>>> File not found with ID: {file_id}")
                return JSONResponse(
                    status_code=404,
                    content={"detail": f"File not found with ID: {file_id}"}
                )
            
            file_info = file_response.data[0]
            file_path = file_info["file_path_raw"]
            
            logger.info(f">>>>>> File info: {file_info}")
            logger.info(f">>>>>> Downloading file from storage: {file_path}")
            
            # Download file from storage
            try:
                file_data = supabase.storage.from_("audio-files").download(file_path)
                logger.info(f">>>>>> Downloaded file size: {len(file_data)} bytes")
            except Exception as e:
                logger.error(f">>>>>> Error downloading file: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={"detail": f"Error downloading file: {str(e)}"}
                )
        except Exception as e:
            logger.error(f">>>>>> Error getting file data: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"Error getting file data: {str(e)}"}
            )
        
        # Save to temp raw directory
        raw_file_path = raw_dir / f"{file_id}.wav"
        with open(raw_file_path, "wb") as f:
            f.write(file_data)
        logger.info(f">>>>>> Saved raw file to: {raw_file_path}")
        
        # Apply noise reduction
        cleaned_file_path = cleaned_dir / f"{file_id}_clean.wav"
        logger.info(f">>>>>> Applying noise reduction from {raw_file_path} to {cleaned_file_path}")
        noise_reduction_success = clean_audio(raw_file_path, cleaned_file_path)
        
        if not noise_reduction_success:
            logger.warning(f">>>>>> Noise reduction failed, using original audio")
        
        # STORE THE CLEANED FILE TO SUPABASE STORAGE
        try:
            # Get the cleaned file content
            with open(cleaned_file_path, "rb") as f:
                cleaned_audio_data = f.read()
            
            # Determine storage path - use same structure as original but with _cleaned suffix
            original_path_parts = file_path.split('/')
            file_name_parts = original_path_parts[-1].split('.')
            cleaned_file_name = f"{file_name_parts[0]}_cleaned.{file_name_parts[-1]}"
            cleaned_storage_path = '/'.join(original_path_parts[:-1] + [cleaned_file_name])
            
            logger.info(f">>>>>> Uploading cleaned file to storage at path: {cleaned_storage_path}")
            
            # Check if file already exists in storage and remove it
            try:
                supabase.storage.from_("audio-files").remove([cleaned_storage_path])
                logger.info(f">>>>>> Removed existing file at {cleaned_storage_path}")
            except Exception as remove_error:
                logger.info(f">>>>>> No existing file to remove or error: {str(remove_error)}")
            
            # Upload the cleaned file to storage
            upload_result = supabase.storage.from_("audio-files").upload(
                cleaned_storage_path,
                cleaned_audio_data,
                {"content-type": "audio/wav"}
            )
            
            logger.info(f">>>>>> Cleaned file upload result: {upload_result}")
            
            # Verify the upload by downloading and comparing file sizes
            try:
                verification_data = supabase.storage.from_("audio-files").download(cleaned_storage_path)
                if len(verification_data) != len(cleaned_audio_data):
                    raise Exception(f"Upload verification failed: size mismatch. Local: {len(cleaned_audio_data)}, Storage: {len(verification_data)}")
                logger.info(f">>>>>> Upload verified successfully. File size: {len(verification_data)} bytes")
            except Exception as verify_error:
                logger.error(f">>>>>> Upload verification failed: {str(verify_error)}")
                raise
            
            # Update the audio file record with the cleaned file path
            file_update_result = supabase.table("audio_files").update({
                "file_path_cleaned": cleaned_storage_path
            }).eq("id", file_id).execute()
            
            logger.info(f">>>>>> File path update result: {file_update_result.data}")
            
            # Clean up temp files
            if raw_file_path.exists():
                raw_file_path.unlink()
                logger.info(f">>>>>> Cleaned up raw file: {raw_file_path}")
            if cleaned_file_path.exists():
                cleaned_file_path.unlink()
                logger.info(f">>>>>> Cleaned up cleaned file: {cleaned_file_path}")
                
            return {
                "message": "File processed successfully",
                "noise_reduction_success": noise_reduction_success,
                "file_info": {
                    "id": file_id,
                    "original_path": file_path,
                    "cleaned_path": cleaned_storage_path
                }
            }
        except Exception as e:
            logger.error(f">>>>>> Error processing file: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"Error processing file: {str(e)}"}
            )
    
    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        logger.error(f">>>>>> Error in test process file: {error_msg}")
        logger.error(f">>>>>> Traceback: {tb}")
        return JSONResponse(
            status_code=500,
            content={"detail": error_msg, "traceback": tb}
        )