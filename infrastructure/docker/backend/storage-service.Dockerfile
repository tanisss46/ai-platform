FROM node:18-alpine

WORKDIR /app

# Install dependencies for image processing
RUN apk add --no-cache vips-dev python3 make g++ libc6-compat \
    ffmpeg poppler-utils

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Create storage directory
RUN mkdir -p /app/storage
# Create thumbnails temp directory
RUN mkdir -p /tmp/aicloud-thumbnails

# Expose the port
EXPOSE 3003

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
