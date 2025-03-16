FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3002

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
