#!/bin/bash

echo "Starting AICloud platform services..."
cd "$(dirname "$0")/../infrastructure/docker" && docker-compose up -d

echo "Services are starting. You can monitor logs with:"
echo "cd infrastructure/docker && docker-compose logs -f"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "API Gateway will be available at: http://localhost:3001"
echo "MinIO admin console will be available at: http://localhost:9001"
