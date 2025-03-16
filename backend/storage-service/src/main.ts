import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix for all routes
  app.setGlobalPrefix('api/storage');
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Storage Service API')
    .setDescription('The Storage Service API for AI Platform')
    .setVersion('1.0')
    .addTag('storage')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/storage/docs', app, document);

  // Start the server
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Storage service is running on port ${port}`);
}

bootstrap();
