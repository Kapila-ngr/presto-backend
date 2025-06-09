import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function generateToken(req: Request, res: Response) {
  const { restaurantId } = req.body;
  if (!restaurantId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'restaurantId is required' });
  }

  const payload = { restaurantId };
  const options = { expiresIn: 60 * 60 }; // 1 hour in seconds
  const token = jwt.sign(payload, JWT_SECRET, options);

  res.status(200).json({ token });
}
