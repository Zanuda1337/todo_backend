import {
  ArgumentMetadata,
  Injectable,
  PipeTransform, ValidationPipeOptions,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../auth/exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any>{
  private readonly options: ValidationPipeOptions
  constructor(options?: ValidationPipeOptions) {
    this.options = {...options}
  }
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
      const obj = plainToInstance(metadata.metatype, value);
      const errors = await validate(obj, this.options);

      if(errors.length) {
        const messages = errors.map(err => {
          return { property: err.property, ...err.constraints };
        })
        throw new ValidationException({ errors: messages })
      }
      return value
    }
}
