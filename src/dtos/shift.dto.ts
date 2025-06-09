import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @IsDateString()
  @IsNotEmpty()
  shiftStart!: string;

  @IsDateString()
  @IsNotEmpty()
  shiftEnd!: string;

  @IsNumber()
  @IsNotEmpty()
  restaurantId!: number;
}

export class UpdateShiftDto {
  @IsDateString()
  shiftStart?: string;

  @IsDateString()
  shiftEnd?: string;

  @IsNumber()
  restaurantId?: number;
}