import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@mail.ru' })
  @IsEmail({}, {message: 'INCORRECT_EMAIL'})
  readonly email: string;

  @ApiProperty({ example: 'joy' })
  @IsNotEmpty()
  @IsString({message: 'SHOULD_BE_STRING'})
  readonly name: string;

  @ApiProperty({ example: 'mitchell' })
  @IsString({message: 'SHOULD_BE_STRING'})
  readonly surname: string;

  @ApiProperty({ example: '123456' })
  @IsString({message: 'SHOULD_BE_STRING'})
  @Length(4, 16, {message: "MORE_THAN_4_AND_LESS_THAN_16"})
  readonly password: string;
}
