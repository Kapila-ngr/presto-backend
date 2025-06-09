"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.assignOrder = assignOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.listOrders = listOrders;
exports.getOrdersByDriverId = getOrdersByDriverId;
exports.getOrderById = getOrderById;
exports.getOrdersByRestaurantId = getOrdersByRestaurantId;
const typeorm_1 = require("typeorm");
const Order_1 = require("../entities/Order");
const order_dto_1 = require("../dtos/order.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Driver_1 = require("../entities/Driver");
// Create a new order
async function createOrder(req, res) {
    const dto = (0, class_transformer_1.plainToInstance)(order_dto_1.CreateOrderDto, req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid order data', errors });
    }
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    const order = orderRepo.create({
        orderNumber: dto.orderNumber,
        restaurant: dto.restaurant,
        customer: dto.customer,
        orderItems: dto.orderItems,
        costing: dto.costing,
        paymentMethod: dto.paymentMethod,
        pickupInstruction: dto.pickupInstruction,
        deliveryInstruction: dto.deliveryInstruction,
        schedule: dto.schedule,
        placementTime: dto.placementTime ? new Date(dto.placementTime) : new Date(),
        assignedTime: dto.assignedTime ? new Date(dto.assignedTime) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        pickedUpTime: dto.pickedUpTime ? new Date(dto.pickedUpTime) : undefined,
        arrivedTime: dto.arrivedTime ? new Date(dto.arrivedTime) : undefined,
        deliveryTime: dto.deliveryTime ? new Date(dto.deliveryTime) : undefined,
        expectedPickupTime: dto.expectedPickupTime,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
        expectedDeliveryTime: dto.expectedDeliveryTime,
        orderStatus: dto.orderStatus || 'CREATED',
        proofOfDelivery: dto.proofOfDelivery,
        feedback: dto.feedback,
        etaTime: dto.etaTime,
    });
    await orderRepo.save(order);
    return res.status(201).json(order);
}
// Assign a driver to an order
async function assignOrder(req, res) {
    const dto = Object.assign(new order_dto_1.AssignOrderDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid assignment data', errors });
    }
    const restaurantId = req.params.locationId;
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const { orderId, driverId } = dto;
    const order = await orderRepo.findOne({ where: { orderId } });
    console.log(`Assigning order ${orderId} to driver ${driverId}`);
    if (!order) {
        return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    const driver = await driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
        return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
    }
    order.assignedCarrier = driver;
    order.orderStatus = 'ASSIGNED';
    if (order)
        order.assignedTime = new Date();
    await orderRepo.save(order);
    res.status(200).json(sanitizeOrder(order));
}
// Update order status
async function updateOrderStatus(req, res) {
    var _a;
    const dto = (0, class_transformer_1.plainToInstance)(order_dto_1.UpdateOrderStatusDto, req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid status data', errors });
    }
    const restaurantId = req.params.locationId;
    console.log(`Restaurant ID from header: ${restaurantId}`);
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    // FIX: Query by orderId, then check restaurant.id in JS
    const order = await orderRepo.findOne({ where: { orderId: req.params.orderId } });
    console.log(`Updating order ${req.params.orderId} status to ${dto.orderState}`);
    if (!order || ((_a = order.restaurant) === null || _a === void 0 ? void 0 : _a.id) !== restaurantId) {
        return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    order.orderStatus = dto.orderState;
    if (order) {
        if (dto.orderState === 'PICKED_UP')
            order.pickedUpTime = new Date();
        else if (dto.orderState === 'EN_ROUTE')
            order.startTime = new Date();
        else if (dto.orderState === 'ARRIVED_AT_DELIVERY')
            order.arrivedTime = new Date();
        else if (dto.orderState === 'DELIVERED') {
            order.deliveryTime = new Date();
            order.proofOfDelivery = dto.proofOfDelivery;
        }
        else if (dto.orderState === 'FAILED') {
            order.proofOfDelivery = dto.proofOfDelivery;
        }
    }
    await orderRepo.save(order);
    res.status(200).json(sanitizeOrder(order));
}
// List orders with optional filtering by restaurant and order status
async function listOrders(req, res) {
    const restaurantId = req.params.locationId;
    const orderState = req.query.orderState;
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    const validStates = [
        'CREATED',
        'ASSIGNED',
        'ACCEPTED',
        'REJECTED',
        'PICKED_UP',
        'EN_ROUTE',
        'ARRIVED_AT_DELIVERY',
        'DELIVERED',
        'FAILED',
    ];
    let where = {};
    if (restaurantId) {
        where['restaurant.id'] = restaurantId;
    }
    if (orderState && validStates.includes(orderState)) {
        where.orderStatus = orderState;
    }
    // Add relations: ['assignedCarrier'] to include driver info
    const orders = await orderRepo.find({ where, relations: ['assignedCarrier'] });
    res.status(200).json(orders.map(sanitizeOrder));
}
// Get all orders assigned to a driver by driverId
async function getOrdersByDriverId(req, res) {
    const driverId = req.params.driverId;
    if (!driverId) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'driverId is required' });
    }
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    const orders = await orderRepo.find({
        where: { assignedCarrier: { id: driverId } },
        relations: ['assignedCarrier'],
    });
    res.status(200).json(orders.map(sanitizeOrder));
}
// Get order by ID
async function getOrderById(req, res) {
    const orderId = req.params.orderId;
    if (!orderId) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'orderId is required' });
    }
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    const order = await orderRepo.findOne({
        where: { orderId },
        relations: ['assignedCarrier'],
    });
    if (!order) {
        return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    res.status(200).json(sanitizeOrder(order));
}
// Get all orders for a restaurant by restaurantId
async function getOrdersByRestaurantId(req, res) {
    const restaurantId = req.params.restaurantId;
    if (!restaurantId) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'restaurantId is required' });
    }
    const orderRepo = (0, typeorm_1.getRepository)(Order_1.Order);
    // Since restaurant is stored as a JSON column, filter in JS after fetching
    const orders = await orderRepo.find({ relations: ['assignedCarrier'] });
    const filteredOrders = orders
        .filter(order => order.restaurant && order.restaurant.id == restaurantId)
        .map(sanitizeOrder);
    res.status(200).json(filteredOrders);
}
// Helper to remove password from driver object
function sanitizeOrder(order) {
    if (order.assignedCarrier) {
        order.assignedCarrier = { ...order.assignedCarrier };
        delete order.assignedCarrier.password;
    }
    return order;
}
//# sourceMappingURL=order.controller.js.map