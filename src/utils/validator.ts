import { validate as classValidate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export async function validate<T extends object>(data: any, type: new () => T): Promise<T | null> {
  const instance = plainToClass(type, data);
  const errors = await classValidate(instance);
  if (errors.length) return null;
  return instance;
}
