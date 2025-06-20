import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import { publishMessages } from './pubsub.service';

export async function updateDriverStatus(
  restaurantId: string,
  driverId: string,
  status: 'ON_DELIVERY' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'AVAILABLE'
) {
  const driverRepo = getRepository(Driver);
  const driver = await driverRepo.findOne({ where: { id: driverId } });
  if (!driver) {
    throw new Error('Driver not found');
  }

  driver.status = status;
  await driverRepo.save(driver);

  // Publish status update to the driver's channel
  const channelName = `driver-${restaurantId}`;
  await publishMessages(channelName, 'DRIVER_STATUS_UPDATED', JSON.stringify({ driverId, status }));
}