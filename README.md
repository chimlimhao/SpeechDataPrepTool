# Khmer Speech Data Preparation Tool

A comprehensive tool for preparing and managing Khmer speech datasets, featuring audio file management, transcription, and dataset statistics.

## Features

- 🎤 Audio file management and organization
- 📊 Dataset statistics and visualization
- 👥 User authentication and project management
- 📱 Responsive modern UI with dark mode support
- 🔍 Search and filter capabilities

## Tech Stack

### Frontend (70% Complete)
- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Chart.js for statistics
- React Icons

### Backend (0% Complete)
- FastAPI (Planned)
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Audio Processing Libraries

## Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup (Coming Soon)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Missing Components

### Frontend (30% Remaining)
1. Audio file upload and processing implementation
2. Real-time audio waveform visualization
3. Audio transcription interface
4. User settings and profile management
5. Error handling and loading states
6. Unit tests and integration tests

### Backend (100% Remaining)
1. Database schema and models
2. User authentication and authorization
3. File upload and storage system
4. Audio processing pipeline
5. API endpoints for:
   - User management
   - Project management
   - File management
   - Transcription management
6. WebSocket for real-time updates
7. Error handling and logging
8. Unit tests and integration tests
9. Documentation (API docs, Swagger)
10. Deployment configuration

### DevOps/Infrastructure
1. Docker configuration
2. CI/CD pipeline
3. Production deployment setup
4. Monitoring and logging
5. Backup strategy

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

[Add your chosen license] 