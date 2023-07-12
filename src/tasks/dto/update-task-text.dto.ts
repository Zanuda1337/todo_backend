import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateTaskTextDto {
  @IsString({message: "MUST_BE_STRING"})
  @Length(1, 60, {message: 'SHOULD_BE_MORE_THAN_1_AND_LESS_THAN_60'})
  @ApiProperty({ example: 'Workout' })
  readonly text: string;
}
