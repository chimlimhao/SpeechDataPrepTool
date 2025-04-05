# Backend Service Setup Guide

This is the backend service for the Speech Data Preparation Tool, handling audio file processing, project management, and integration with ASR services.

## Prerequisites

- Python 3.9 or higher
- Virtual environment tool (venv)
- Supabase account and project
- ASR services running (see machine-learning/README.md)

## Setup Instructions

1. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
ASR_SERVICE_URL=http://localhost:8000  # or 8001 for Whisper
CORS_ORIGINS=["http://localhost:3000"]  # Frontend URL
```

4. **Database Setup**
- Ensure your Supabase project has the required tables:
  - projects
  - audio_files
  - users (managed by Supabase Auth)

## Project Structure
```
backend/
├── models/           # Data models and schemas
├── repository/       # Data access layer
│   └── supabase/    # Supabase implementation
├── service/         # Business logic layer
├── main.py         # FastAPI application
└── requirements.txt
```

## Running the Service

### Development Mode
```bash
uvicorn main:app --reload --port 8080
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

## API Endpoints

### Project Management
```
GET /project/{project_id}
POST /project/process/{project_id}
```

### Audio Processing
```
POST /test/denoise
POST /test/process-file
```

## Error Handling

The service includes comprehensive error handling for:
- Invalid project IDs
- File processing errors
- Database connection issues
- ASR service communication errors

## Logging

Logs are written to:
- Console (development)
- Application log file (production)

## Security

- JWT-based authentication using Supabase
- Role-based access control
- Secure file handling

## Troubleshooting

1. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure proper table structure

2. **File Processing Errors**
   - Check ASR service availability
   - Verify file permissions
   - Monitor disk space

3. **Authentication Issues**
   - Validate JWT tokens
   - Check Supabase configuration
   - Verify user permissions 