# Khmer Speech Data Preparation Tool

A comprehensive tool for preparing and managing Khmer speech datasets, featuring audio preprocessing, transcription, and standardized dataset exports for speech recognition research.

## 🌟 Features

- **User Authentication** - Secure login with Google OAuth integration
- **Project Management** - Create and manage multiple speech dataset projects
- **Flexible Upload Options** - Single or bulk audio file uploads
- **Audio Processing Pipeline**:
  - Automatic noise reduction using DeepFilterNet
  - Speech-to-text transcription using fine-tuned Wav2Vec2 models with a Khmer dataset
  - Real-time processing status updates
- **Transcription Workflow**:
  - Edit and annotate transcriptions
  - Manual validation and correction interfaces
  - Manual saving of edits
- **Dataset Export** - Generate standardized datasets following OpenSLR conventions

## 🏗️ Architecture

The application follows a semi-microservice architecture with 4 main components:

1. **Frontend Service** - Next.js web application following the Layered Architecture with Repository Design Pattern for easier management, flexibility and maintainability and Provider (useContext for global state management)
2. **Backend Service** - FastAPI REST API for business logic(data processing logic) following the Repository Design Pattern
3. **Machine Learning Service** - ASR service for speech transcription
4. **Cloud Service** - Supabase for database, real-time, storage, and authentication

### Communication Flow

Services primarily interact through Supabase and APIs:
- **Frontend** reads/writes data to Supabase and reacts to real-time changes
- **Frontend** triggers the **Backend** via API calls
- **Backend** performs noise cleaning and communicates with the **ML Service** for transcription
- **ML Service** processes speech-to-text conversion and returns results to the **Backend**
- **Backend** updates results in **Supabase**
- Changes are synchronized via Supabase's real-time capabilities

Each service maintains its own data access patterns:
- Frontend directly interfaces with Supabase for real-time data synchronization and authentication
- Backend uses Supabase as its primary datastore with service-specific repositories
- Both services access the same Supabase instance but through separate access patterns and security profiles

## 🛠️ Tech Stack

### Frontend
- **Next.js 13** (App Router) - Server-side rendering and modern React features
- **TypeScript** - Type safety and improved developer experience
- **Tailwind CSS** - Utility-first CSS for rapid UI development
- **Shadcn/UI** - Accessible and customizable component library
- **Supabase Client** - Real-time database subscriptions and authentication
- **Repository Pattern** - Abstraction layer for data access operations
- **Provider Pattern** - Global state management with React Context API
<!-- - **Chart.js** - Interactive data visualization -->

### Backend
- **FastAPI** - High-performance Python API framework
- **Python 3.10+** - Latest language features
- **DeepFilterNet** - State-of-the-art audio noise reduction
- **SoundFile** - Audio file processing
- **Supabase Admin SDK** - Database and storage management
- **Repository Pattern** - Separation of business logic from data access

### Machine Learning
- **Hugging Face Transformers** - Pre-trained speech recognition models
- **Wav2Vec2** - XLS-R based Khmer speech recognition model fine-tuned on Khmer dataset
- **PyTorch** - Deep learning framework
- **FastAPI** - API framework for the ASR service
- **CUDA** (optional) - GPU acceleration

### Infrastructure
- **Supabase** - PostgreSQL database, object storage, and authentication
- **Real-time Subscriptions** - Instant UI updates on data changes
- **Row-Level Security** - Fine-grained access control

## 📋 Prerequisites

- Node.js 16+
- Python 3.10+
- Supabase account
- Google OAuth credentials (for authentication)
- CUDA-compatible GPU (optional, for faster ML processing)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/khmer-speech-data-prep-tool.git
cd khmer-speech-data-prep-tool
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase and OAuth settings
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 3. Backend Setup 

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase and service configuration
uvicorn main:app --reload --port 8080
```

The backend API will be available at `http://localhost:8080`

### 4. Machine Learning Service

```bash
cd machine-learning/asr_service/wav2vec2-vitouphy
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with your HuggingFace token
# HUGGINGFACE_TOKEN=your_token_here
uvicorn app:app --reload --port 8000
```

The ASR service will be available at `http://localhost:8000`

### 5. Supabase Setup

#### 5.1 Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project and note down the project URL and API keys
3. You'll need both the `anon` public key and the `service_role` key:
   - `anon` key: Used by the frontend for authenticated user operations
   - `service_role` key: Used by the backend to bypass RLS policies for administrative operations

#### 5.2 Set Up Database Tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  progress INTEGER DEFAULT 0,
  total_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  total_duration DECIMAL DEFAULT 0,
  dataset_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create audio_files table
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path_raw TEXT NOT NULL,
  file_path_cleaned TEXT,
  file_size BIGINT,
  format TEXT,
  duration DECIMAL,
  transcription_status TEXT DEFAULT 'pending',
  transcription_content TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE audio_files;
```

#### 5.3 Storage Bucket Setup

1. In the Supabase dashboard, go to Storage
2. Create a new bucket called `audio-files`
3. Set the following permissions (or adjust as needed):
   - Public bucket: No (set to private)
   - RLS policy: Enable

#### 5.4 Authentication Setup

1. Go to Authentication → Settings
2. Enable Email/Password sign-in
3. For Google OAuth:
   - Register an application in [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth credentials and get the Client ID and Secret
   - Add these credentials in the Supabase dashboard under Auth → Settings → External OAuth Providers → Google

#### 5.5 Row Level Security (RLS) Policies

Set these policies to secure your data:

```sql
-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = created_by);

-- Allow users to insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = created_by);

-- Audio Files RLS
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own audio files
CREATE POLICY "Users can view their own audio files" ON audio_files
  FOR SELECT USING (
    auth.uid() IN (
      SELECT created_by FROM projects WHERE id = project_id
    )
  );

-- Allow users to insert audio files into their projects
CREATE POLICY "Users can insert audio files" ON audio_files
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM projects WHERE id = project_id
    )
  );

-- Storage Policies
-- Allow authenticated users to upload files
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Allow users to view their own files
CREATE POLICY "Allow viewing own files" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );
```

#### 5.6 Environment Variables Configuration

**For Frontend (.env.local)**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**For Backend (.env)**:
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ASR_SERVICE_URL=http://localhost:8000
```

The service role key is essential for the backend to bypass RLS policies when processing data across multiple users' projects.

## 📊 Database and Data Flow

Supabase serves as the central hub connecting frontend and backend services:

- **Authentication Flow**:
  - Frontend handles user authentication via Supabase Auth
  - Backend verifies authentication via JWT tokens before processing data

- **Data Processing Flow**:
  1. Frontend uploads audio files to Supabase Storage
  2. Frontend creates records in Supabase Database
  3. Frontend sends an API request to the backend to trigger processing, passing the project ID
  4. Backend receives the request, fetches project data from Supabase
  5. Backend performs noise cleaning on the audio files
  6. Backend sends cleaned audio to the ML Service via API for transcription
  7. ML Service processes speech-to-text and returns transcriptions to the Backend
  8. Backend updates the status and results in Supabase
  9. Frontend receives real-time updates via Supabase subscriptions
  10. User edits transcriptions in Frontend which updates Supabase directly

Key tables include:
- `projects` - Project metadata and settings
- `audio_files` - Audio file metadata and processing status
- `user` - User information

## 🔄 Workflow

1. **Authentication** - Sign in with Google account
2. **Project Creation** - Create a new speech dataset project
3. **Upload** - Add audio files individually or in bulk
4. **Processing** - Trigger audio cleaning and transcription via backend API
5. **Transcription** - Review and edit generated transcriptions
6. **Export** - Generate a standardized dataset following OpenSLR format

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Wav2Vec2 XLS-R Khmer](https://huggingface.co/vitouphy/wav2vec2-xlc-r-300m-khmer) by Vitou Phy
- [DeepFilterNet](https://github.com/rikorose/DeepFilterNet) for audio enhancement
- [Supabase](https://supabase.com/) for backend infrastructure
- [ShadCN UI](https://ui.shadcn.com/) for component library
