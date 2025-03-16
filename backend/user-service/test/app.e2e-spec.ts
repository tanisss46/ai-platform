import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UserService (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    // Clean database before tests
    await prismaService.user.deleteMany();
    
    await app.init();
  });

  afterAll(async () => {
    // Clean up after tests
    await prismaService.user.deleteMany();
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Auth', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    };
    
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('displayName', testUser.displayName);
          expect(res.body).not.toHaveProperty('password');
        });
    });
    
    it('should login a user and return a token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', testUser.email);
        });
    });
    
    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong-password',
        })
        .expect(401);
    });
  });

  describe('Users', () => {
    let authToken: string;
    let userId: string;
    
    beforeAll(async () => {
      // Create a user and login to get token
      const user = await prismaService.user.create({
        data: {
          email: 'user-test@example.com',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // "Password123!" hashed
          displayName: 'User Test',
        },
      });
      
      userId = user.id;
      
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user-test@example.com',
          password: 'Password123!',
        });
      
      authToken = loginResponse.body.token;
    });
    
    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', 'user-test@example.com');
        });
    });
    
    it('should update user profile', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          displayName: 'Updated Name',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('displayName', 'Updated Name');
        });
    });
    
    it('should reject unauthorized requests', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });
});
