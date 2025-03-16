# AICloud Platform

AICloud is a comprehensive cloud-based platform that integrates various AI tools into a single ecosystem with built-in storage capabilities. Users can generate content using state-of-the-art AI models like Midjourney, Stable Diffusion, Kling AI, and MMAudio without any local installation requirements.

## Features

- **Integrated Cloud Storage**: Mac Finder-like interface for managing AI-generated content
- **AI Tool Integration**: Use multiple AI tools from a single platform
- **LLM Orchestration**: Control AI tools using natural language commands
- **API Catalog**: Discover and use various AI models
- **Workflow Automation**: Chain multiple AI tools together
- **User-Friendly Interface**: Intuitive dashboard and file management

## Architecture

The platform uses a microservice architecture with the following components:

- **Frontend**: Next.js-based web application
- **API Gateway**: Entry point for all client requests
- **User Service**: Handles authentication and user management
- **Storage Service**: Manages file storage and organization
- **LLM Assistant Service**: Processes natural language commands
- **AI Orchestration Service**: Coordinates AI model executions
- **Notification Service**: Handles email and in-app notifications

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB
- PostgreSQL
- Redis
- S3-compatible storage (MinIO)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-platform.git
   cd ai-platform
   ```

2. Install dependencies for all services:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend/api-gateway
   npm install
   cd ../user-service
   npm install
   cd ../storage-service
   npm install
   cd ../llm-assistant-service
   npm install
   cd ../ai-orchestration-service
   npm install
   cd ../notification-service
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy environment variable templates
   cp .env.example .env
   ```

4. Start the development environment using Docker Compose:
   ```bash
   # From the project root
   cd infrastructure/docker
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

### Running Tests

```bash
# Run tests for a specific service
cd backend/user-service
npm test

# Run end-to-end tests
npm run test:e2e
```

## Deployment

The platform can be deployed to a Kubernetes cluster:

1. Set up the required secrets:
   ```bash
   kubectl create secret generic aicloud-secrets \
     --from-literal=JWT_SECRET=your-secret-key \
     --from-literal=POSTGRES_PASSWORD=your-password \
     --from-literal=S3_ACCESS_KEY=your-access-key \
     --from-literal=S3_SECRET_KEY=your-secret-key \
     --from-literal=OPENAI_API_KEY=your-openai-key \
     --from-literal=MIDJOURNEY_API_KEY=your-midjourney-key \
     --from-literal=STABLE_DIFFUSION_API_KEY=your-stable-diffusion-key \
     --from-literal=KLING_AI_API_KEY=your-kling-ai-key \
     --from-literal=MMAUDIO_API_KEY=your-mmaudio-key
   ```

2. Deploy using Kubernetes configuration:
   ```bash
   kubectl apply -f infrastructure/kubernetes/namespace.yaml
   kubectl apply -f infrastructure/kubernetes/config-maps.yaml
   kubectl apply -f infrastructure/kubernetes/services
   kubectl apply -f infrastructure/kubernetes/deployments
   ```

## Development Roadmap

### Phase 1: MVP (3-4 months)
- Basic user authentication
- Core storage functionality
- Initial AI model integrations
- Simple folder views
- Basic LLM command processing

### Phase 2: Core Platform (3-4 months)
- Advanced file explorer
- 30+ AI tool integrations
- Full LLM assistant capabilities
- Team collaboration features

### Phase 3: Complete Platform (4-6 months)
- Complex workflows and chains
- 100+ AI tool integrations
- Advanced file management
- Custom model deployment

### Phase 4: Ecosystem (Ongoing)
- Marketplace for third-party integrations
- SDK for partner APIs
- Enterprise features and integrations
- Mobile applications

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -am 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
