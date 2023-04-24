import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getAllHotels } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getAllHotels).get('/:hotelId');

export { hotelsRouter };
