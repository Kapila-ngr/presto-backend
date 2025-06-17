import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class IdToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  token!: string;

  @Column({ type: 'varchar', length: 100 })
  appName!: string;

  @CreateDateColumn()
  issuedAt!: Date;

  @Column({ default: true })
  isActive!: boolean;
}