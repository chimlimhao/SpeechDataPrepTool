from fastapi import FastAPI, File, UploadFile, HTTPException, Body
import os
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import io
import soundfile as sf
from pydantic import BaseModel
from typing import Optional, Union
from fastapi.responses import JSONResponse
import logging
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware to allow requests from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3001"],  # Backend and Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioData(BaseModel):
    audio_bytes: str  # base64 encoded audio data
    filename: str

# Model Path
MODEL_ID = "vithouphy/wav2vec2-xlc-r-300m-khmer"
MODEL_PATH = "./model"

# Add healthcheck endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": MODEL_ID}

try:
    processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)
    model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH)
    print("Model loaded from local path")
except:
    print("Downloading model from HuggingFace...")
    processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
    model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)

    os.makedirs(MODEL_PATH, exist_ok=True)
    processor.save_pretrained(MODEL_PATH)
    model.save_pretrained(MODEL_PATH)
    print("Model downloaded and saved locally")

async def process_audio(audio_bytes: bytes, filename: str):
    """Common processing function for both routes"""
    if not filename.endswith('.wav'):
        raise HTTPException(status_code=400, detail="Only WAV files are supported")
        
    try:
        # Convert bytes to audio data using IO buffer
        audio_buffer = io.BytesIO(audio_bytes)
        try:
            audio_input, samplerate = sf.read(audio_buffer)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Failed to process audio file. Make sure it's a valid WAV file.")
        
        # Process for model
        try:
            input_values = processor(
                audio_input,
                sampling_rate=samplerate,
                return_tensors="pt"
            ).input_values
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to process audio with the model processor")
        
        # Get prediction
        try:
            logits = model(input_values).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = processor.decode(predicted_ids[0])
            
            return {
                "transcription": transcription,
                "filename": filename,
                "status": "success"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to generate transcription")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# @app.post("/transcribe/file")
# async def transcribe_file(file: UploadFile = File(...)):
#     """Endpoint for file upload (e.g., from Postman for testing)"""
#     audio_bytes = await file.read()
#     return await process_audio(audio_bytes, file.filename)

@app.post("/transcribe")
async def transcribe_bytes(audio_data: AudioData):
    """Endpoint for direct byte data from backend"""
    import base64
    logger.info(f"Received request to transcribe bytes, filename: {audio_data.filename}")
    logger.info(f"Audio data length: {len(audio_data.audio_bytes)} characters")
    
    try:
        # Decode base64 string to bytes
        logger.info("Decoding base64 data...")
        audio_bytes = base64.b64decode(audio_data.audio_bytes)
        logger.info(f"Decoded to {len(audio_bytes)} bytes")
        
        result = await process_audio(audio_bytes, audio_data.filename)
        logger.info(f"Processing complete: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing audio data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid audio data format: {str(e)}")

