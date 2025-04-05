from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv
from repository.supabase.supabase_project_repository import SupabaseProjectRepository
from service.project_service import ProjectService
from service.test_service import TestService
from service.auth_service import AuthService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

# Get frontend URL from environment variable, default to local development URL
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
logger.info(f"Using frontend URL for CORS: {frontend_url}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize repository and services
repository = SupabaseProjectRepository()
project_service = ProjectService(repository)
test_service = TestService(repository)
auth_service = AuthService(repository)

@app.post("/project/process/{projectid}")
async def process_project(projectid: str, user_id: str = Depends(auth_service.get_current_user)):
    """Process a project's audio files"""
    try:
        result = await project_service.process_project(projectid, user_id)
        return result
    except Exception as e:
        logger.error(f"Error processing project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/test/denoise")
# async def test_denoise(file_id: str = None):
#     """Test endpoint for noise reduction"""
#     try:
#         result = await test_service.test_denoise(file_id)
#         return result
#     except Exception as e:
#         logger.error(f"Error in test denoise: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/test/process/{file_id}")
# async def test_process_file(file_id: str):
#     """Test endpoint for processing a single file"""
#     try:
#         result = await test_service.test_process_file(file_id)
#         return result
#     except Exception as e:
#         logger.error(f"Error in test process file: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)