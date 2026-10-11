import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema, ZodTypeDef } from 'zod';
import { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe<TInput = unknown, TOutput = TInput> implements PipeTransform<TInput, TOutput> {
  constructor(private readonly schema: ZodSchema<TOutput, ZodTypeDef, TInput>) {}

  transform(value: TInput, _metadata: ArgumentMetadata): TOutput {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        throw new BadRequestException({ message: 'Validation failed', details });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

export function ZodBody<T>(schema: ZodSchema<T, ZodTypeDef, unknown>) {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingPipes: Array<{ index: number; pipes: unknown[] }> = Reflect.getMetadata('__zod_pipes__', target.constructor, propertyKey) ?? [];
    existingPipes.push({ index: parameterIndex, pipes: [new ZodValidationPipe(schema)] });
    Reflect.defineMetadata('__zod_pipes__', existingPipes, target.constructor, propertyKey);
  };
}
