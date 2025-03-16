#!/bin/bash

echo "Stopping AICloud platform services..."
cd "$(dirname "$0")/../infrastructure/docker" && docker-compose down

echo "All services stopped."
