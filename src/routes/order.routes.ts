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
router.put('/:orderId/status',  updateOrderStatus);
router.get('/location/:locationId/list',  listOrders);
router.get('/:driverId',  getOrdersByDriverId);
router.get('/:driverId/completed',  getCompletedOrdersByDriverId);
router.get('/:orderId',  getOrderById);

export default router;
