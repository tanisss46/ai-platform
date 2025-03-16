FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Copy the rest of the application code
COPY . .

# Install next globally to ensure it's available
RUN npm install -g next

# We'll build the application during dev, not in the Dockerfile
# This helps with development

# Expose the port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
