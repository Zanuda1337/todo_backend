import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: '3cc6ac1f-08e6-40af-9fd0-26c6929c1fae' })
  @IsUUID(4,{message: "MUST_BE_UUIDV4"})
  readonly id: string;

  @IsOptional()
  @IsString({message: "MUST_BE_STRING"})
  @Length(1, 12, {message: 'SHOULD_BE_MORE_THAN_1_AND_LESS_THAN_12'})
  @ApiProperty({ example: 'business', required: false })
  readonly name: string;

  @IsOptional()
  @IsString({message: "MUST_BE_STRING"})
  @ApiProperty({ example: 'blue', required: false })
  readonly color: string;

  @IsOptional()
  @IsArray({message: 'SHOULD_BE_ARRAY'})
  // @IsUUID(4, {message: 'EACH_SHOULD_BE_UUIDV4', each: true})
  @ApiProperty({ example: ['6de9351c-82e6-4208-aca9-290b1ca3ed77', 'e3a0822b-3fc7-4608-8356-7ef1ca161f37'], required: false })
  readonly memberIds: string[] | null
}
