import express from 'express';
import { createConnection } from 'typeorm';
import bodyParser from 'body-parser';
import cors from 'cors';
import orderRoutes from './routes/order.routes';
import driverRoutes from './routes/driver.routes';
import shiftRoutes from './routes/shift.routes';
import { generateToken, invalidateIdToken } from './controllers/token.controller';
import { subscribeToChannel, publishSampleMessage } from './services/pubsub.service';

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
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'presto_dispatch',
    entities: ['src/entities/*.ts'],
    synchronize: true
  });
}

app.use('/v1/orders', orderRoutes);
app.use('/v1/drivers', driverRoutes);
app.use('/v1/shifts', shiftRoutes);
app.post('/v1/tokens/generate-token', generateToken);
app.post('/v1/tokens/invalidate', invalidateIdToken);

// Subscribe to a test channel on server start
// subscribeToChannel('order-36726661', (message) => {
//   console.log('Ably received (from index.ts):', message.data);
// });

// Optionally, publish a sample message after a short delay
// setTimeout(() => {
//   publishSampleMessage('test-channel','sample-event', 'Hello from server startup!');
// }, 2000);

async function startServer() {
  await initializeDatabase();
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

startServer().catch(console.error);
