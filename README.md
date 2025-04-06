# Khmer Speech Data Preparation Tool

A comprehensive tool for preparing and managing Khmer speech datasets, featuring audio file management, transcription, and dataset statistics.

## Features

- 🎤 Audio file management and organization
- 📊 Dataset statistics and visualization
- 👥 User authentication and project management
- 📱 Responsive modern UI with dark mode support
- 🔍 Search and filter capabilities

## Tech Stack

### Frontend
- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Chart.js for statistics
- React Icons

### Backend
- FastAPI
- PostgreSQL + Supabase
- JWT Authentication
- Audio Processing Libraries

## Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3001`

### Backend Setup 
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

### Machine Learning
```bash
cd machine-learning/asr_service/wav2vec2
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```
## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

[Add your chosen license] 
