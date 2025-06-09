import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import { CreateDriverDto, UpdateDriverDto } from '../dtos/driver.dto';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

// Driver login function (passport-local style, but manual)
export async function driverLogin(req: Request, res: Response) {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Phone number and password are required' });
  }

  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { phoneNumber } });
  if (!driver) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid phone number or password' });
  }

  const isMatch = await bcrypt.compare(password, driver.password);
  if (!isMatch) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid phone number or password' });
  }

  // Remove password before sending response
  const { password: _, ...driverSafe } = driver;
  res.status(200).json({ message: 'Login successful', driver: driverSafe });
}

// Request password reset
export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email is required' });
  }

  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { email } });
  if (!driver) {
    // For security, don't reveal if email exists
    return res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
  }

  // Generate a reset token and expiry (e.g., 1 hour)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);

  // Save to driver (add these fields to your Driver entity if not present)
  driver.resetToken = resetToken;
  driver.resetTokenExpiry = resetTokenExpiry;
  await driverRepo.save(driver);

  // Send resetToken to driver via email (implement your email logic here)
  // e.g., sendEmail(driver.email, `Reset link: https://yourapp/reset?token=${resetToken}`)

  res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
}

// Reset password using token
export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Token and new password are required' });
  }

  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { resetToken: token } });

  if (!driver || !driver.resetTokenExpiry || driver.resetTokenExpiry < new Date()) {
    return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }

  driver.password = await bcrypt.hash(newPassword, 10);
  driver.resetToken = null;
  driver.resetTokenExpiry = null;
  await driverRepo.save(driver);

  res.status(200).json({ message: 'Password has been reset successfully.' });
}