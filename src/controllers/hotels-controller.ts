import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelsService.getAllHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
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
