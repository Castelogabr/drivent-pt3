import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    await hotelsService.verifyTicketAndEnrollment(userId);

    const hotels = await hotelsService.getAllHotels();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send();
    }
    if (error.name === 'PaymentError') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send();
    }
    return res.status(httpStatus.BAD_REQUEST).send();
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;

  if (!hotelId) return res.status(httpStatus.NOT_FOUND).send('search not found');

  try {
    const rooms = await hotelsService.getHotelsById(+hotelId, userId);
    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    if (error.name === 'PaymentError') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send();
    }
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send();
    }
    return res.status(httpStatus.BAD_REQUEST).send();
  }
}
