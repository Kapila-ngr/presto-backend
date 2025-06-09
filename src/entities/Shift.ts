import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './Driver';

@Entity()
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;

  @Column({ type: 'datetime' })
  shiftStart!: Date;

  @Column({ type: 'datetime' })
  shiftEnd!: Date;

  @Column({ type: 'bigint' })
  restaurantId!: number;
}