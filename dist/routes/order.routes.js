"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const router = (0, express_1.Router)();
router.post('/create', order_controller_1.createOrder);
router.post('/assign', order_controller_1.assignOrder);
router.put('/:orderId/status', order_controller_1.updateOrderStatus);
router.get('/list', order_controller_1.listOrders);
router.get('/:driverId', order_controller_1.getOrdersByDriverId);
router.get('/:orderId', order_controller_1.getOrderById);
exports.default = router;
//# sourceMappingURL=order.routes.js.map