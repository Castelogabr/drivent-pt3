import { notFoundError, paymentError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getAllHotels() {
  const hotels = await hotelsRepository.getAllHotels();

  if (!hotels) throw notFoundError();

  return hotels;
}

async function verifyTicketAndEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (!ticket.TicketType.includesHotel || ticket.status === 'RESERVED' || ticket.TicketType.isRemote) {
    throw paymentError();
  }
}
const hotelsService = {
  getAllHotels,
  verifyTicketAndEnrollment,
};

export default hotelsService;
