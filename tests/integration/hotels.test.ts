import httpStatus from 'http-status';
import supertest from 'supertest';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import { createUser, createEnrollmentWithAddress, createHotel } from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});
afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const result = await server.get('/hotels');

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
});
describe('when token is valid', () => {
  it('should respond with status 404 when it doesnt have an hotel yet', async () => {
    const token = await generateValidToken();

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.NOT_FOUND);
  });
  it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
    const token = await generateValidToken();
    await createHotel();

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 when user doesnt have a ticket yet', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    await createHotel();

    const result = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.NOT_FOUND);
  });
});
