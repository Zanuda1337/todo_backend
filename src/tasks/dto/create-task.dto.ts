import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateTaskDto {
  @IsUUID(4, {message: 'SHOULD_BE_UUIDV4'})
  @ApiProperty({ example: '1b8de2d4-02fc-4ef7-92f9-9091122741ed', required: true })
  readonly categoryId: string

  @IsString({message: "MUST_BE_STRING"})
  @Length(1, 60, {message: 'SHOULD_BE_MORE_THAN_1_AND_LESS_THAN_60'})
  @ApiProperty({ example: 'Pay for rent' })
  readonly text: string;
}
