import { notFoundError, paymentError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getAllHotels(userId: number) {
  await verifyTicket(userId);
  await verifyEnrollment(userId);

  const hotels = await hotelsRepository.getAllHotels();

  if (!hotels) throw notFoundError();

  return hotels;
}

async function verifyTicket(userId: number) {
  const ticket = await ticketsRepository.findTicketByEnrollmentId(userId);

  if (!ticket) throw notFoundError();

  if (!ticket.TicketType.includesHotel || ticket.status === 'RESERVED' || ticket.TicketType.isRemote) {
    throw paymentError();
  }
}

async function verifyEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();
}
const hotelsService = {
  getAllHotels,
  verifyTicket,
  verifyEnrollment,
};

export default hotelsService;
