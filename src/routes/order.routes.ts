import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createOrder,
  assignOrder,
  updateOrderStatus,
  listOrders,
  getOrdersByDriverId,
  getOrderById,
  getCompletedOrdersByDriverId
} from '../controllers/order.controller';

const router = Router();

router.post('/create',  createOrder);
router.post('/assign',  assignOrder);
router.put('/:orderId/status', authMiddleware(['driver']), updateOrderStatus);
router.get('/location/:locationId/list', listOrders);
router.get('/driver/:driverId', authMiddleware(['driver']), getOrdersByDriverId);
router.get('/:driverId/completed',  authMiddleware(['driver','app']), getCompletedOrdersByDriverId);
router.get('/order/:orderId', authMiddleware(['driver']),  getOrderById);

export default router;
