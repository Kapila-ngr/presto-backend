import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  phoneNumber!: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  vehicleModel!: string;

  @Column()
  vehicleRegistration!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken?: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiry?: Date | null;

  @Column({ unique: true })
  colorCode!: string;

  @Column({ type: 'simple-json', nullable: true })
  restaurantIds?: string[];

  @Column({
    type: 'enum',
    enum: [
      'ON_DELIVERY',
      'EN_ROUTE',
      'ARRIVED_AT_DELIVERY',
      'AVAILABLE'
    ],
    nullable: true
  })
  status?: 'ON_DELIVERY' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'AVAILABLE';

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}