import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function driverAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Use your actual secret
    // Optionally attach driver info to req for later use
    (req as any).driver = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}