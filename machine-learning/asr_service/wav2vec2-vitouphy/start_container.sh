#!/bin/bash

echo "Starting ASR service container..."
docker-compose up -d

echo "Waiting for service to be ready..."
sleep 10

echo "Testing healthcheck endpoint..."
curl http://localhost:8000/health

echo -e "\n\nASR service is ready. You can test transcription with:"
echo "python test_asr.py"

echo -e "\n\nTo stop the container, run:"
echo "docker-compose down" 