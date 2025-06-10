import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Driver login function using email as key, returns driver details + token
export async function driverLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password are required' });
  }

  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { email } });
  if (!driver) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, driver.password);
  if (!isMatch) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  }

  // Remove password before sending response
  const { password: _, ...driverSafe } = driver;

  // Generate a non-expiring token (for demo; in production, set an expiry)
  const token = jwt.sign(
    { id: driver.id, email: driver.email },
    'your_jwt_secret' // Replace with your actual secret
    // No expiresIn for non-expiring token
  );

  res.status(200).json({ message: 'Login successful', driver: driverSafe, token });
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