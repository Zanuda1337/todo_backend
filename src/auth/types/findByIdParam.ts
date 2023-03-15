import { IsString, IsUUID } from 'class-validator';

export class FindByIdParam {
  @IsString()
  @IsUUID(4, {message: 'MUST_BE_UUIDV4'})
  id: string;
}
