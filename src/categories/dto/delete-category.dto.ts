import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class DeleteCategoryDto {
  @IsArray({message: 'SHOULD_BE_ARRAY'})
  @ApiProperty({ example: ['6de9351c-82e6-4208-aca9-290b1ca3ed77', 'e3a0822b-3fc7-4608-8356-7ef1ca161f37'], required: false })
  readonly categoryIds: string[]
}
