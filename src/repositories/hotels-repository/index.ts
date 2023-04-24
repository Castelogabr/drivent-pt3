import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany();
}

export default {
  getAllHotels,
};
