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
    return res.status(400).json({ message: 'Invalid shift data', data: { errors } });
  }

  const driverRepo = getRepository(Driver);
  const shiftRepo = getRepository(Shift);

  const driver = await driverRepo.findOne({ where: { id: dto.driverId } });
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found', data: {} });
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
    return res.status(400).json({ message: 'Driver is already on shift', data: {} });
  } else {
    const shift = shiftRepo.create({
      driver,
      shiftStart: new Date(dto.shiftStart),
      shiftEnd: new Date(dto.shiftEnd),
      restaurantId: dto.restaurantId,
    });
    await shiftRepo.save(shift);
    return res.status(201).json({ message: 'Shift created successfully', data: shift });
  }
}

// Update an existing shift
export async function updateShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const dto = Object.assign(new UpdateShiftDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid shift data', data: { errors } });
  }

  const shiftRepo = getRepository(Shift);
  const shift = await shiftRepo.findOne({ where: { id: shiftId } });
  if (!shift) {
    return res.status(404).json({ message: 'Shift not found', data: {} });
  }

  if (dto.shiftStart) shift.shiftStart = new Date(dto.shiftStart);
  if (dto.shiftEnd) shift.shiftEnd = new Date(dto.shiftEnd);
  if (dto.restaurantId !== undefined) shift.restaurantId = dto.restaurantId;

  await shiftRepo.save(shift);
  return res.status(200).json({ message: 'Shift updated successfully', data: shift });
}

// Is driver on shift
export async function isDriverOnShift(req: Request, res: Response) {
  const driverId = req.params.driverId;
  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: driverId } });

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found', data: {} });
  } else {
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
      message: 'Driver shift status fetched',
      data: {
        driverId,
        onShift: !!onShift
      }
    });
  }
}