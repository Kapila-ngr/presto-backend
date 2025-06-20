import { IsString, IsNotEmpty, IsOptional, MinLength, IsEnum } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel!: string;

  @IsString()
  @IsNotEmpty()
  vehicleRegistration!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsEnum([
    'ON_DELIVERY',
    'EN_ROUTE',
    'ARRIVED_AT_DELIVERY',
    'AVAILABLE'
  ])
  @IsOptional()
  status?: 'ON_DELIVERY' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'AVAILABLE';

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  vehicleModel?: string;

  @IsString()
  @IsOptional()
  vehicleRegistration?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsEnum([
    'ASSIGNED',
    'ACCEPTED',
    'REJECTED',
    'PICKED_UP',
    'EN_ROUTE',
    'ARRIVED_AT_DELIVERY',
    'DELIVERED',
    'FAILED'
  ])
  @IsOptional()
  status?: 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'DELIVERED' | 'FAILED';

  @IsString()
  @IsOptional()
  deviceId?: string;
}