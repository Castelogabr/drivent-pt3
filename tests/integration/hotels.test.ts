import httpStatus from 'http-status';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createUser,
  createEnrollmentWithAddress,
  createHotel,
  createTicketType,
  createTicket,
  createHotelRoomsTicketType,
} from '../factories';
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

  it('should respond with status 402 when user have a ticket with status RESERVED', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createHotel();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 402 when user have a ticket with a remote ticket type', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createHotel();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createHotelRoomsTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 402 when user have a ticket that doesnt include Hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createHotel();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createHotelRoomsTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 200 and an array of hotels if ticket paid and includes hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createHotelRoomsTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.OK);
    expect(result.body).toEqual([
      {
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
      },
    ]);
  });
});
