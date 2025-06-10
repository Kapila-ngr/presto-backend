import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import { CreateDriverDto, UpdateDriverDto } from '../dtos/driver.dto';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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
  const driverRepo = getRepository(Driver);
  const drivers = await driverRepo.find();
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

