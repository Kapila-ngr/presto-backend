import { Router } from 'express';
import {
  createShift,
  updateShift,
  isDriverOnShift,
} from '../controllers/shift.controller';

const router = Router();

router.post('/create', createShift);
router.put('/update/:id', updateShift);
router.get('/check/:driverId', isDriverOnShift);

export default router;