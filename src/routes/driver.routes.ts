import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createDriver,
  listDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller';

import {
  driverLogin,
  requestPasswordReset,
  resetPassword,
  driverLogout,
} from '../controllers/auth.controller';

import {
  createShift,
  updateShift,
  isDriverOnShift,
} from '../controllers/shift.controller';
import { driverAuthMiddleware } from '../middleware/driver.auth';

const router = Router();

router.post('/create', createDriver);
router.post('/login', driverLogin);   
router.post('/logout', authMiddleware(['driver']), driverLogout);

// Protected routes
router.get('/:locationId/list', listDrivers);
router.get('/:locationId/:id', getDriver);
router.put('/:id', authMiddleware(['driver']), updateDriver);
router.delete('/:id', authMiddleware(['driver']), deleteDriver);
router.post('/forgot-password', requestPasswordReset); 
router.post('/reset-password', resetPassword);        



export default router;