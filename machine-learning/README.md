# ASR Service Setup Guide

This directory contains ASR (Automatic Speech Recognition) services that can be run either using Docker or directly with Python.

## Available Services

1. **Wav2Vec2** (Port 8000) - `asr_service/wav2vec2-vitouphy/`
2. **Whisper** (Port 8001) - `asr_service/whisper-kaksoky/`

## Setup Options

### Option 1: Direct Python Setup

1. **Create Virtual Environment and Install Dependencies**
```bash
cd asr_service/wav2vec2-vitouphy  # or whisper-kaksoky
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

2. **Run the Service**
```bash
uvicorn app:app --reload --port 8000  # Use 8001 for Whisper
```

### Option 2: Using Docker (Optional)

If you prefer using Docker:
```bash
cd asr_service/wav2vec2-vitouphy  # or whisper-kaksoky
./start_container.sh
```

## Using Custom Models

Place your trained model files in the respective model directory:

### Wav2Vec2
```
model/
├── config.json
├── preprocessor_config.json
├── special_tokens_map.json
├── tokenizer_config.json
├── tokenizer.json
└── pytorch_model.bin
```

### Whisper
```
model/
├── model.pt
└── config.json  # if needed
```

## API Endpoints

```
GET /health          # Health check
POST /transcribe     # Transcribe audio file (multipart/form-data)
```

## Environment Setup

Create `.env` file:
```env
MODEL_PATH=./model
ASR_BATCH_SIZE=16
DEVICE=cuda  # or cpu
```

## Troubleshooting

- **Model Issues**: Check model files are in correct directory
- **GPU Usage**: Set DEVICE=cpu in .env if no GPU available
- **Audio Processing**: Verify ffmpeg installation for Whisper 