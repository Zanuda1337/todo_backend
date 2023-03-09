import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'user@mail.ru' })
  readonly email: string;

  @ApiProperty({ example: '123456' })
  readonly password: string;

  @ApiProperty({ example: true, required: false })
  readonly rememberMe: boolean;
}
