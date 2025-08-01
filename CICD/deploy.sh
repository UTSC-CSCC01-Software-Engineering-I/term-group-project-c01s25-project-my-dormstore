#!/bin/bash

echo "Starting MyDormStore Deployment..."

# Pull the latest image
echo "Pulling latest Docker image..."
docker pull ashleylinn/mydormstore:latest

# Deploy with Docker Compose
echo "Deploying with Docker Compose..."
cd CICD
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 15

# Health check
echo " Running health check..."
if curl --silent --show-error http://localhost:5001/; then
    echo " Deployment successful! Server is running at http://localhost:5001"
else
    echo "Deployment failed! Server is not responding"
    exit 1
fi

echo "Deployment complete!" 