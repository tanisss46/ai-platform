import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix for all routes
  app.setGlobalPrefix('api/assistant');
  
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
    .setTitle('LLM Assistant Service API')
    .setDescription('The LLM Assistant Service API for AI Platform')
    .setVersion('1.0')
    .addTag('assistant')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/assistant/docs', app, document);

  // Start the server
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`LLM Assistant service is running on port ${port}`);
}

bootstrap();
