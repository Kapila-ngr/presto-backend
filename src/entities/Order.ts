import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './Driver';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  orderId!: string;

  @Column()
  orderNumber!: string;

  @Column('json')
  restaurant!: {
    id: string;
    name: string;
    address: string;
    phoneNumber?: string;
    latitude?: number;
    longitude?: number;
  };

  @Column('json')
  customer!: {
    name: string;
    address: string;
    phoneNumber: string;
    emailAddress?: string;
    latitude?: number;
    longitude?: number;
  };

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'assignedCarrierId' })
  assignedCarrier?: Driver;

  @Column('json')
  orderItems!: { name: string; quantity: number; unitPrice: number }[];

  @Column('json')
  costing!: {
    totalCost: number;
    deliveryFee: number;
    tip?: number;
    discountAmount?: number;
    tax?: number;
    cashTip?: number;
  };

  @Column()
  paymentMethod!: 'CASH' | 'CARD' | 'ONLINE';

  @Column({ nullable: true })
  pickupInstruction?: string;

  @Column({ nullable: true })
  deliveryInstruction?: string;

  @Column()
  schedule!: boolean;

  @Column()
  placementTime!: Date;

  @Column({ nullable: true })
  assignedTime?: Date;

  @Column({ nullable: true })
  startTime?: Date;

  @Column({ nullable: true })
  pickedUpTime?: Date;

  @Column({ nullable: true })
  arrivedTime?: Date;

  @Column({ nullable: true })
  deliveryTime?: Date;

  @Column({ nullable: true })
  expectedPickupTime?: string;

  @Column({ nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ nullable: true })
  expectedDeliveryTime?: string;

  @Column({
    type: 'enum',
    enum: [
      'CREATED',
      'ASSIGNED',
      'ACCEPTED',
      'REJECTED',
      'PICKED_UP',
      'EN_ROUTE',
      'ARRIVED_AT_DELIVERY',
      'DELIVERED',
      'FAILED',
    ],
    default: 'CREATED',
  })
  orderStatus!: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'DELIVERED' | 'FAILED';

  @Column('json', { nullable: true })
  proofOfDelivery?: {
    signaturePath?: string;
    imageUrls?: string[];
    latitude?: number;
    longitude?: number;
  };

  @Column({ nullable: true })
  feedback?: number;

  @Column({ nullable: true })
  etaTime?: string;
}
