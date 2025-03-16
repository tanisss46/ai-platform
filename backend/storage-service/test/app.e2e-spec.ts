import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

describe('StorageService (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    jwtService = app.get<JwtService>(JwtService);
    
    // Create a fake JWT token for testing
    authToken = jwtService.sign({ 
      sub: 'test-user-id',
      email: 'test@example.com',
    });
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Folders', () => {
    it('should create a new folder', () => {
      return request(app.getHttpServer())
        .post('/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Folder',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test Folder');
          expect(res.body).toHaveProperty('ownerId', 'test-user-id');
        });
    });
    
    it('should get user folders', () => {
      return request(app.getHttpServer())
        .get('/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name', 'Test Folder');
        });
    });
  });

  describe('Content', () => {
    it('should get user content', () => {
      return request(app.getHttpServer())
        .get('/content')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', () => {
      return request(app.getHttpServer())
        .get('/folders')
        .expect(401);
    });
  });
});
