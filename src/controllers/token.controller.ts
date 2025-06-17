import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { IdToken } from '../entities/IdToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function generateToken(req: Request, res: Response) {
  const { appName } = req.body;
  if (!appName) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'appName is required' });
  }

  const payload = { appName , role: 'app' };
  // No expiresIn for non-expiring token
  const token = jwt.sign(payload, JWT_SECRET);

  // Save token to IdToken entity
  const idTokenRepo = getRepository(IdToken);
  await idTokenRepo.save({
    token,
    appName,
    isActive: true
  });

  res.status(200).json({ token });
}

export async function invalidateIdToken(req: Request, res: Response) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'token is required' });
  }

  const idTokenRepo = getRepository(IdToken);
  const tokenRecord = await idTokenRepo.findOne({ where: { token, isActive: true } });

  if (!tokenRecord) {
    return res.status(404).json({ code: 'TOKEN_NOT_FOUND', message: 'Active token not found' });
  }

  tokenRecord.isActive = false;
  await idTokenRepo.save(tokenRecord);

  res.status(200).json({ message: 'Token invalidated successfully' });
}
