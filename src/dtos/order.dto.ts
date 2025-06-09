import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RestaurantDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsOptional() phoneNumber?: string;
  @IsNumber() @IsOptional() latitude?: number;
  @IsNumber() @IsOptional() longitude?: number;
}

export class CustomerDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() phoneNumber!: string;
  @IsString() @IsOptional() emailAddress?: string;
  @IsNumber() @IsOptional() latitude?: number;
  @IsNumber() @IsOptional() longitude?: number;
}

export class OrderItemDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsNumber() @IsNotEmpty() quantity!: number;
  @IsNumber() @IsNotEmpty() unitPrice!: number;
}

export class CostingDto {
  @IsNumber() @IsNotEmpty() totalCost!: number;
  @IsNumber() @IsNotEmpty() deliveryFee!: number;
  @IsNumber() @IsOptional() tip?: number;
  @IsNumber() @IsOptional() discountAmount?: number;
  @IsNumber() @IsOptional() tax?: number;
  @IsNumber() @IsOptional() cashTip?: number;
}

export class ProofOfDeliveryDto {
  @IsString() @IsOptional() signaturePath?: string;
  @IsArray() @IsOptional() imageUrls?: string[];
  @IsNumber() @IsOptional() latitude?: number;
  @IsNumber() @IsOptional() longitude?: number;
}

export class CreateOrderDto {
  @IsString() @IsOptional() orderNumber?: string;

  @ValidateNested()
  @Type(() => RestaurantDto)
  restaurant!: RestaurantDto;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems!: OrderItemDto[];

  @ValidateNested()
  @Type(() => CostingDto)
  costing!: CostingDto;

  @IsEnum(['CASH', 'CARD', 'ONLINE'])
  paymentMethod!: 'CASH' | 'CARD' | 'ONLINE';

  @IsString() @IsOptional() pickupInstruction?: string;
  @IsString() @IsOptional() deliveryInstruction?: string;
  @IsBoolean() schedule!: boolean;

  @IsDateString() placementTime!: string;

  @IsDateString() @IsOptional() assignedTime?: string;
  @IsDateString() @IsOptional() startTime?: string;
  @IsDateString() @IsOptional() pickedUpTime?: string;
  @IsDateString() @IsOptional() arrivedTime?: string;
  @IsDateString() @IsOptional() deliveryTime?: string;

  @IsString() @IsOptional() expectedPickupTime?: string;
  @IsDateString() @IsOptional() expectedDeliveryDate?: string;
  @IsString() @IsOptional() expectedDeliveryTime?: string;

  @IsEnum([
    'CREATED',
    'ASSIGNED',
    'ACCEPTED',
    'REJECTED',
    'PICKED_UP',
    'EN_ROUTE',
    'ARRIVED_AT_DELIVERY',
    'DELIVERED',
    'FAILED',
  ])
  @IsOptional()
  orderStatus?: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'DELIVERED' | 'FAILED';

  @ValidateNested()
  @Type(() => ProofOfDeliveryDto)
  @IsOptional()
  proofOfDelivery?: ProofOfDeliveryDto;

  @IsNumber() @IsOptional() feedback?: number;
  @IsString() @IsOptional() etaTime?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum([
    'CREATED',
    'ASSIGNED',
    'ACCEPTED',
    'REJECTED',
    'PICKED_UP',
    'EN_ROUTE',
    'ARRIVED_AT_DELIVERY',
    'DELIVERED',
    'FAILED',
  ])
  orderState!: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'EN_ROUTE' | 'ARRIVED_AT_DELIVERY' | 'DELIVERED' | 'FAILED';

  @ValidateNested()
  @Type(() => ProofOfDeliveryDto)
  @IsOptional()
  proofOfDelivery?: ProofOfDeliveryDto;
}

export class AssignOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  driverId!: string;
}
