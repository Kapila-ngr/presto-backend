import { Request, Response } from 'express';
import { getRepository, Raw, In } from 'typeorm';
import { Order } from '../entities/Order';
import { CreateOrderDto, AssignOrderDto, UpdateOrderStatusDto, CostingDto } from '../dtos/order.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Driver } from '../entities/Driver';
import { publishSampleMessage } from '../services/pubsub.service';

/**
 * Publishes a message to the restaurant's order channel.
 * @param restaurantId The restaurant ID (string)
 * @param event The event name (string)
 * @param payload The payload to send (any)
 */
export async function publishOrderEvent(restaurantId: string, event: string, payload: any) {
  if (!restaurantId || !event || !payload) {
    throw new Error('restaurantId, event, and payload are required');
  }
  const channelName = `order-${restaurantId}`;
  await publishSampleMessage(channelName, event, payload);
}

// Create a new order
export async function createOrder(req: Request, res: Response) {
  const dto = plainToInstance(CreateOrderDto, req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid order data', errors });
  }

  const orderRepo = getRepository(Order);

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
  publishOrderEvent(order.restaurant.id, 'ORDER_CREATED',order);
  return res.status(201).json({ message: 'Order created successfully', data: sanitizeOrder(order.orderId) });
}

// Assign a driver to an order
export async function assignOrder(req: Request, res: Response) {
  const dto = Object.assign(new AssignOrderDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid assignment data', errors });
  }

  const restaurantId = req.params.locationId as string;
  const orderRepo = getRepository(Order);
  const driverRepo = getRepository(Driver);

  const { orderId, driverId } = dto;

  const order = await orderRepo.findOne({ where: { orderId } });
  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  const driver = await driverRepo.findOne({ where: { id: driverId } });
  if (!driver) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }

  order.assignedCarrier = driver;
  order.orderStatus = 'ASSIGNED';
  if (order) order.assignedTime = new Date();
  await orderRepo.save(order);

  res.status(200).json({ message: 'Order assigned successfully', data: sanitizeOrder(order.orderId) });
}

// Update order status
export async function updateOrderStatus(req: Request, res: Response) {
  const dto = plainToInstance(UpdateOrderStatusDto, req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid status data', errors });
  }

  const orderRepo = getRepository(Order);

  // Query by orderId only
  const order = await orderRepo.findOne({ where: { orderId: req.params.orderId } });

  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  order.orderStatus = dto.orderState;
  if (order) {
    if (dto.orderState === 'PICKED_UP') order.pickedUpTime = new Date();
    else if (dto.orderState === 'EN_ROUTE') order.startTime = new Date();
    else if (dto.orderState === 'ARRIVED_AT_DELIVERY') order.arrivedTime = new Date();
    else if (dto.orderState === 'DELIVERED') {
      order.deliveryTime = new Date();
      order.proofOfDelivery = dto.proofOfDelivery;
    } else if (dto.orderState === 'FAILED') {
      order.proofOfDelivery = dto.proofOfDelivery;
    }
  }

  await orderRepo.save(order);
  publishOrderEvent(order.restaurant.id, 'ORDER_STATUS_UPDATED', order);
  res.status(200).json({ message: 'Order status updated successfully', data: sanitizeOrder(order.orderId) });
}

// List orders with optional filtering by restaurant and order status
export async function listOrders(req: Request, res: Response) {
  const restaurantId = req.params.locationId as string;
  const orderState = req.query.orderState as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const orderRepo = getRepository(Order);

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
  ] as const;

  let where: any = {};
  if (orderState && validStates.includes(orderState as any)) {
    where.orderStatus = orderState as typeof validStates[number];
  }

  // Fetch all orders (optionally filtered by status)
  const orders = await orderRepo.find({ where, relations: ['assignedCarrier'] });

  // Filter by restaurantId in JS
  const filteredOrders = restaurantId
    ? orders.filter(order => order.restaurant && order.restaurant.id == restaurantId)
    : orders;

  // Paginate in JS
  const total = filteredOrders.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    page,
    limit,
    total,
    totalPages,
    data: paginatedOrders.map(sanitizeOrder),
  });
}

// Get all orders assigned to a driver by driverId
export async function getOrdersByDriverId(req: Request, res: Response) {
  const driverId = req.params.driverId;
  if (!driverId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'driverId is required' });
  }

  const orderRepo = getRepository(Order);
  // Exclude completed statuses
  const completedStatuses = ['DELIVERED', 'FAILED'];
  const orders = await orderRepo.find({
    where: {
      assignedCarrier: { id: driverId },
      orderStatus: Raw(status => `NOT (${completedStatuses.map(s => `'${s}'`).join(' OR orderStatus = ')})`)
    },
    relations: ['assignedCarrier'],
  });
  res.status(200).json({ message: 'All inprogress orders', data:{ orders : orders.map(sanitizeOrder)}  });
}

// Get order by ID
export async function getOrderById(req: Request, res: Response) {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'orderId is required' });
  }

  const orderRepo = getRepository(Order);
  const order = await orderRepo.findOne({
    where: { orderId },
    relations: ['assignedCarrier'],
  });

  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  res.status(200).json({ message: 'Order fetched successfully', data: sanitizeOrder(order) });
}

// Get all orders for a restaurant by restaurantId
export async function getOrdersByRestaurantId(req: Request, res: Response) {
  const restaurantId = req.params.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'restaurantId is required' });
  }

  const orderRepo = getRepository(Order);
  // Since restaurant is stored as a JSON column, filter in JS after fetching
  const orders = await orderRepo.find({ relations: ['assignedCarrier'] });
  const filteredOrders = orders
    .filter(order => order.restaurant && order.restaurant.id == restaurantId)
    .map(sanitizeOrder);

  res.status(200).json({ message: 'Orders fetched successfully', data: filteredOrders });
}

// Get all completed orders assigned to a driver by driverId
export async function getCompletedOrdersByDriverId(req: Request, res: Response) {
  const driverId = req.params.driverId;
  if (!driverId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'driverId is required' });
  }

  // Pagination params
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const orderRepo = getRepository(Order);
  const completedStatuses = ['DELIVERED', 'FAILED'];

  const [orders, total] = await orderRepo.findAndCount({
    where: {
      assignedCarrier: { id: driverId },
      orderStatus: In(completedStatuses),
    },
    relations: ['assignedCarrier'],
    skip,
    take: limit,
    order: { deliveryTime: 'DESC' }
  });

  res.status(200).json({
    data: { page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    orders : orders.map(sanitizeOrder)},
  });
}

// Publish order message to pub/sub
export async function publishOrderMessage(req: Request, res: Response) {
  const { restaurantId, event, payload } = req.body;

  if (!restaurantId || !event || !payload) {
    return res.status(400).json({ message: 'restaurantId, event, and payload are required', data: {} });
  }

  const channelName = `orders-${restaurantId}`;

  try {
    await publishSampleMessage(channelName, event, payload);
    return res.status(200).json({ message: 'Message published successfully', data: { channelName, event, payload } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to publish message', data: { error: err } });
  }
}

// Helper to remove assignedCarrier from order object in the response
function sanitizeOrder(order: any) {
  if (order.assignedCarrier) {
    delete order.assignedCarrier;
  }
  return order;
}


