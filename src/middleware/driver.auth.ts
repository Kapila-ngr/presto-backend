import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { DriverToken } from '../entities/DriverToken';

export async function driverAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const driverTokenRepo = getRepository(DriverToken);
  const tokenRecord = await driverTokenRepo.findOne({ where: { token, isActive: true } });
  if (!tokenRecord) {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Token is not active or has been logged out' });
  }

  next();
}