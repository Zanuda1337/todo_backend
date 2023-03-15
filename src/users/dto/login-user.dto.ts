import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'user@mail.ru' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  readonly password: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  readonly rememberMe: boolean;
}
