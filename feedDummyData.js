const axios = require('axios');

const API_URL = 'http://localhost:3000';
const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with your actual JWT token
const RESTAURANT_ID = 'r1'; // Use the correct restaurant id for your headers

const drivers = [
  { name: 'Alice Smith', phoneNumber: '+1111111111', email: 'alice@example.com', vehicleModel: 'Toyota Prius', vehicleRegistration: 'ABC123', password: 'password1' },
  { name: 'Bob Jones', phoneNumber: '+1222222222', email: 'bob@example.com', vehicleModel: 'Honda Civic', vehicleRegistration: 'DEF456', password: 'password2' },
  { name: 'Charlie Lee', phoneNumber: '+1333333333', email: 'charlie@example.com', vehicleModel: 'Ford Focus', vehicleRegistration: 'GHI789', password: 'password3' },
  { name: 'Diana Prince', phoneNumber: '+1444444444', email: 'diana@example.com', vehicleModel: 'Tesla Model 3', vehicleRegistration: 'JKL012', password: 'password4' },
  { name: 'Evan Wright', phoneNumber: '+1555555555', email: 'evan@example.com', vehicleModel: 'Chevy Bolt', vehicleRegistration: 'MNO345', password: 'password5' },
  { name: 'Fiona Hall', phoneNumber: '+1666666666', email: 'fiona@example.com', vehicleModel: 'Nissan Leaf', vehicleRegistration: 'PQR678', password: 'password6' },
  { name: 'George King', phoneNumber: '+1777777777', email: 'george@example.com', vehicleModel: 'Hyundai Ioniq', vehicleRegistration: 'STU901', password: 'password7' },
  { name: 'Hannah Scott', phoneNumber: '+1888888888', email: 'hannah@example.com', vehicleModel: 'Kia Niro', vehicleRegistration: 'VWX234', password: 'password8' },
  { name: 'Ian Moore', phoneNumber: '+1999999999', email: 'ian@example.com', vehicleModel: 'Mazda 3', vehicleRegistration: 'YZA567', password: 'password9' },
  { name: 'Julia Reed', phoneNumber: '+1010101010', email: 'julia@example.com', vehicleModel: 'VW Golf', vehicleRegistration: 'BCD890', password: 'password10' }
];

const orders = [
  {
    orderNumber: '1001',
    restaurant: { id: 'r1', name: 'Pizza Place', address: '123 Main St' },
    customer: { name: 'Tom', address: '456 Oak St', phoneNumber: '+1111111111' },
    orderItems: [{ name: 'Pizza', quantity: 2, unitPrice: 12.5 }],
    costing: { totalCost: 25, deliveryFee: 3 },
    paymentMethod: 'CASH',
    pickupInstruction: 'Call on arrival',
    deliveryInstruction: 'Leave at door',
    schedule: false,
    placementTime: new Date().toISOString()
  },
  // ...add 9 more orders with different data as in your SQL example...
];

const shifts = [
  // driverId will be filled after driver creation
  { shiftStart: '2024-06-03T08:00:00Z', shiftEnd: '2024-06-03T16:00:00Z', restaurantId: 1 },
  { shiftStart: '2024-06-03T09:00:00Z', shiftEnd: '2024-06-03T17:00:00Z', restaurantId: 2 },
  { shiftStart: '2024-06-03T10:00:00Z', shiftEnd: '2024-06-03T18:00:00Z', restaurantId: 3 },
  { shiftStart: '2024-06-03T11:00:00Z', shiftEnd: '2024-06-03T19:00:00Z', restaurantId: 4 },
  { shiftStart: '2024-06-03T12:00:00Z', shiftEnd: '2024-06-03T20:00:00Z', restaurantId: 5 },
  { shiftStart: '2024-06-03T13:00:00Z', shiftEnd: '2024-06-03T21:00:00Z', restaurantId: 6 },
  { shiftStart: '2024-06-03T14:00:00Z', shiftEnd: '2024-06-03T22:00:00Z', restaurantId: 7 },
  { shiftStart: '2024-06-03T15:00:00Z', shiftEnd: '2024-06-03T23:00:00Z', restaurantId: 8 },
  { shiftStart: '2024-06-03T16:00:00Z', shiftEnd: '2024-06-04T00:00:00Z', restaurantId: 9 },
  { shiftStart: '2024-06-03T17:00:00Z', shiftEnd: '2024-06-04T01:00:00Z', restaurantId: 10 }
];

async function main() {
  // 1. Create drivers
  const driverIds = [];
  for (const driver of drivers) {
    const res = await axios.post(`${API_URL}/drivers/create`, driver, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    driverIds.push(res.data.id);
    console.log('Created driver:', res.data.name, res.data.id);
  }

  // 2. Create orders (assign each order to a driver)
  const orderIds = [];
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const res = await axios.post(`${API_URL}/orders/create`, order, {
      headers: {
        'x-restaurant-id': order.restaurant.id
      }
    });
    orderIds.push(res.data.orderId);
    console.log('Created order:', res.data.orderNumber, res.data.orderId);

    // Optionally assign order to driver
    if (driverIds[i]) {
      await axios.post(`${API_URL}/orders/assign`, {
        orderId: res.data.orderId,
        driverId: driverIds[i]
      }, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'x-restaurant-id': order.restaurant.id
        }
      });
      console.log(`Assigned order ${res.data.orderId} to driver ${driverIds[i]}`);
    }
  }

  // 3. Create shifts for each driver
  for (let i = 0; i < shifts.length; i++) {
    const shift = { ...shifts[i], driverId: driverIds[i] };
    const res = await axios.post(`${API_URL}/drivers/${driverIds[i]}/shifts`, shift, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    console.log('Created shift for driver:', driverIds[i]);
  }
}

main().catch(err => {
  if (err.response) {
    console.error('API error:', err.response.data);
  } else {
    console.error(err);
  }
});