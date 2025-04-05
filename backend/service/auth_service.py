import logging
from fastapi import HTTPException, Header
from repository.supabase.supabase_project_repository import SupabaseProjectRepository

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, repository: SupabaseProjectRepository):
        self.repository = repository

    async def get_current_user(self, authorization: str = Header(...)) -> str:
        """Extract user ID from Supabase JWT token"""
        try:
            token = authorization.replace('Bearer ', '')
            user = self.repository.supabase.auth.get_user(token)
            
            if not user.user or not user.user.id:
                raise HTTPException(status_code=401, detail="Invalid user data in token")
                
            return user.user.id
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}") 