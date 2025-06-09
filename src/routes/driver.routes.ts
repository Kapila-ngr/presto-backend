import { Router } from 'express';
import {
  createDriver,
  listDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  driverLogin,
  requestPasswordReset,
  resetPassword,
} from '../controllers/driver.controller';
import {
  createShift,
  updateShift,
  isDriverOnShift,
} from '../controllers/shift.controller';

const router = Router();

router.post('/create', createDriver);
router.post('/login', driverLogin);
router.get('/:locationId/list', listDrivers);
router.get('/:locationId/:id', getDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.post('/shifts', createShift);
router.put('/shifts/:id', updateShift);
router.get('/:locationId/:driverId/is-on-shift', isDriverOnShift);

export default router;