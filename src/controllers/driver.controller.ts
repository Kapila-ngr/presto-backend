import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import { CreateDriverDto, UpdateDriverDto } from '../dtos/driver.dto';
import { validate } from 'class-validator';
import { publishMessages } from '../services/pubsub.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Publishes a message to the restaurant's order channel.
 * @param restaurantId The restaurant ID (string)
 * @param event The event name (string)
 * @param payload The payload to send (any)
 */
export async function publishDriverEvent(driverId: string, event: string, payload: any) {
  if (!driverId || !event || !payload) {
    throw new Error('restaurantId, event, and payload are required');
  }
  const channelName = `driver-${driverId}`;
  await publishMessages(channelName, event, JSON.stringify(payload));
}

// Create a new driver
export async function createDriver(req: Request, res: Response) {
  const dto = Object.assign(new CreateDriverDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid driver data', errors });
  }
  const driverRepo = getRepository(Driver);
  const driver = driverRepo.create(dto);
  await driverRepo.save(driver);
  res.status(201).json({ ...driver, password: undefined }); // Do not return password
}

// Get all drivers
export async function listDrivers(req: Request, res: Response) {
  const restaurantId = req.params.locationId;
  const driverRepo = getRepository(Driver);
  let drivers = await driverRepo.find();

  if (restaurantId) {
    drivers = drivers.filter(d =>
      Array.isArray(d.restaurantIds) && d.restaurantIds.includes(restaurantId)
    );
  }

  res.status(200).json(drivers.map(d => ({ ...d, password: undefined })));
}

// Get a single driver by ID
export async function getDriver(req: Request, res: Response) {
  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: req.params.id } });
  if (!driver) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }
  res.status(200).json({ ...driver, password: undefined });
}

// Update a driver by ID
export async function updateDriver(req: Request, res: Response) {
  const dto = Object.assign(new UpdateDriverDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid driver data', errors });
  }
  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: req.params.id } });
  if (!driver) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }
  driverRepo.merge(driver, dto);
  await driverRepo.save(driver);
  res.status(200).json({ ...driver, password: undefined });
}

// Delete a driver by ID
export async function deleteDriver(req: Request, res: Response) {
  const driverRepo = getRepository(Driver);
  const result = await driverRepo.delete(req.params.id);
  if (result.affected === 0) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }
  res.status(204).send();
}

// Add a restaurant to a driver's list
export async function addRestaurantToDriver(req: Request, res: Response) {
  const driverId = req.params.id;
  const { restaurantId } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ message: 'restaurantId is required', data: {} });
  }

  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: driverId } });
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found', data: {} });
  }

  // Ensure restaurantIds is an array
  driver.restaurantIds = Array.isArray(driver.restaurantIds) ? driver.restaurantIds : [];

  // Prevent duplicates
  if (!driver.restaurantIds.includes(restaurantId)) {
    driver.restaurantIds.push(restaurantId);
    await driverRepo.save(driver);
  }

  res.status(200).json({
    message: 'Restaurant added to driver successfully',
    data: { driverId, restaurantIds: driver.restaurantIds }
  });
}

