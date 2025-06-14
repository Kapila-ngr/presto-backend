import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Shift } from '../entities/Shift';
import { Driver } from '../entities/Driver';
import { CreateShiftDto, UpdateShiftDto } from '../dtos/shift.dto';
import { validate } from 'class-validator';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { log } from 'console';

// Create a new shift
export async function createShift(req: Request, res: Response) {
  const dto = Object.assign(new CreateShiftDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid shift data', errors });
  }

  const driverRepo = getRepository(Driver);
  const shiftRepo = getRepository(Shift);

  const driver = await driverRepo.findOne({ where: { id: dto.driverId } });
  if (!driver) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }

  // Check if the driver is already on shift
  const now = new Date();
  const existingShift = await shiftRepo.findOne({
    where: {
      driver: { id: dto.driverId },
      shiftStart: LessThanOrEqual(now),
      shiftEnd: MoreThanOrEqual(now)
    },
    relations: ['driver']
  });
  if (existingShift) {
    return res.status(400).json({ code: 'DRIVER_ON_SHIFT', message: 'Driver is already on shift' });
  }else {
    const shift = shiftRepo.create({
    driver,
    shiftStart: new Date(dto.shiftStart),
    shiftEnd: new Date(dto.shiftEnd),
    restaurantId: dto.restaurantId,
  });
  await shiftRepo.save(shift);
  res.status(201).json(shift);
  }
  
  
}

// Update an existing shift
export async function updateShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const dto = Object.assign(new UpdateShiftDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid shift data', errors });
  }

  const shiftRepo = getRepository(Shift);
  const shift = await shiftRepo.findOne({ where: { id: shiftId } });
  if (!shift) {
    return res.status(404).json({ code: 'SHIFT_NOT_FOUND', message: 'Shift not found' });
  }

  if (dto.shiftStart) shift.shiftStart = new Date(dto.shiftStart);
  if (dto.shiftEnd) shift.shiftEnd = new Date(dto.shiftEnd);
  if (dto.restaurantId !== undefined) shift.restaurantId = dto.restaurantId;

  await shiftRepo.save(shift);
  res.status(200).json(shift);
}


export async function isDriverOnShift(req: Request, res: Response) {
  const driverId = req.params.driverId;
  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: driverId } });

  if (!driver) {
    return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
  }else {
  const now = new Date();
  const shiftRepo = getRepository(Shift);
  const onShift = await shiftRepo.findOne({
    where: {
      driver: { id: driverId },
      shiftStart: LessThanOrEqual(now),
      shiftEnd: MoreThanOrEqual(now)
    }
  });
  return res.status(200).json({
    driverId,
    onShift: !!onShift
  });}
}