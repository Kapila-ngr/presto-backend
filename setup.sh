#!/bin/bash

# Script to add /generate-token endpoint to simple-delivery-backend

# Project directory
CONTROLLERS_DIR="src/controllers"
INDEX_FILE="src/index.ts"

# Create token controller
cat > "$CONTROLLERS_DIR/token.controller.ts" << 'EOF'
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function generateToken(req: Request, res: Response) {
  const { restaurantId } = req.body;
  if (!restaurantId) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'restaurantId is required' });
  }

  const payload = { restaurantId };
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, JWT_SECRET, options);

  res.status(200).json({ token });
}
EOF

# Update index.ts to include /generate-token route
cat > "$INDEX_FILE" << 'EOF'
import express from 'express';
import { createConnection } from 'typeorm';
import bodyParser from 'body-parser';
import cors from 'cors';
import orderRoutes from './routes/order.routes';
import { generateToken } from './controllers/token.controller';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

async function initializeDatabase() {
  await createConnection({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'your_password',
    database: process.env.DATABASE_NAME || 'simple_delivery',
    entities: ['src/entities/*.ts'],
    synchronize: true
  });
}

app.use('/orders', orderRoutes);
app.post('/generate-token', generateToken);

async function startServer() {
  await initializeDatabase();
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

startServer().catch(console.error);
EOF