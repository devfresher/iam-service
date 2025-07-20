import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { getConnection } from 'typeorm';

describe('HealthModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let healthId: string;
  let authId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Create a mock user (Admin) via signup
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'admin@mail.com',
        username: 'admin',
        password: 'password123',
        roles: ['Admin'],
      });

    authId = signupRes.body.user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mail.com', password: 'password123' });

    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  it('POST /health - create health record', async () => {
    const res = await request(app.getHttpServer())
      .post('/health')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        authId,
        fullName: 'John Doe',
        gender: 'Male',
        dob: '1990-01-01',
        phone: '08012345678',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.firstName).toBe('John');
    expect(res.body.lastName).toBe('Doe');
    healthId = res.body.id;
  });

  it('GET /health/:id - get by id (admin)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/health/${healthId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(healthId);
    expect(res.body.firstName).toBe('John');
  });

  it('GET /health - list health records', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.meta.total).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('firstName');
  });

  it('PUT /health/:id - update health record', async () => {
    const res = await request(app.getHttpServer())
      .put(`/health/${healthId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '08123456789' })
      .expect(200);

    expect(res.body.phone).toBe('08123456789');
  });

  it('DELETE /health/:id - soft delete record', async () => {
    await request(app.getHttpServer())
      .delete(`/health/${healthId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/health/${healthId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
