import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const restaurantId = req.params.locationId as string;

  if (!token || !restaurantId) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing token or restaurant ID' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { restaurantId: string };
    if (decoded.restaurantId !== restaurantId) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Restaurant ID mismatch' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}
