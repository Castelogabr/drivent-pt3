import { notFoundError, paymentError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getAllHotels() {
  const hotels = await hotelsRepository.getAllHotels();

  if (!hotels.length) throw notFoundError();

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

async function getHotelsById(hotelId: number, userId: number) {
  await verifyTicketAndEnrollment(userId);

  const rooms = await hotelsRepository.findHotelById(hotelId);

  if (!rooms) {
    throw notFoundError();
  }

  return rooms;
}
const hotelsService = {
  getAllHotels,
  verifyTicketAndEnrollment,
  getHotelsById,
};

export default hotelsService;
