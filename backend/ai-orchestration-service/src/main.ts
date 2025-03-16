import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors();
  
  // Use compression for responses
  app.use(compression());
  
  // Use helmet for security headers
  app.use(helmet());
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Get port from env or use default
  const port = configService.get<number>('PORT', 3005);
  
  await app.listen(port);
  console.log(`AI Orchestration Service is running on port ${port}`);
}

bootstrap();
