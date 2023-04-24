import { notFoundError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';

async function getAllHotels() {
  const hotels = await hotelsRepository.getAllHotels();

  if (!hotels) throw notFoundError();

  return hotels;
}

const hotelsService = {
  getAllHotels,
};

export default hotelsService;
