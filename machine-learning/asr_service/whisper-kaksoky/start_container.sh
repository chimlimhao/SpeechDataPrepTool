#!/bin/bash

# Stop and remove existing container if it exists
docker stop whisper-asr-service || true
docker rm whisper-asr-service || true

# Build and start the container using docker-compose
docker-compose up --build -d

# Show the logs
docker-compose logs -f 