import { IsEmail } from 'class-validator';

export class FindByEmailParam {
  @IsEmail({},{message: 'INCORRECT_EMAIL'})
  email: string;
}
