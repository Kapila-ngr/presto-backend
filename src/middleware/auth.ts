import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { DriverToken } from '../entities/DriverToken';
import { IdToken } from '../entities/IdToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function authMiddleware(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (decoded.role === 'driver') {
        const driverTokenRepo = getRepository(DriverToken);
        const tokenRecord = await driverTokenRepo.findOne({ where: { token, isActive: true } });
        if (!tokenRecord) {
          return res.status(401).json({ message: 'Token is not active or has been logged out' });
        }
      } else {
        // For other roles, validate token from IdToken table
        const idTokenRepo = getRepository(IdToken);
        const tokenRecord = await idTokenRepo.findOne({ where: { token, isActive: true } });
        if (!tokenRecord) {
          return res.status(401).json({ message: 'Token is not active or has been logged out' });
        }
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
