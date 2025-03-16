FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Install utilities for thumbnail generation
RUN apk add --no-cache \
    ffmpeg \
    imagemagick

# Create required directories
RUN mkdir -p /app/uploads /app/temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose the application port
EXPOSE 3002

# Run the application
CMD ["node", "dist/main"]
