import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
 @ApiProperty({ example: 'business' })
 readonly name: string;

 @ApiProperty({ example: 'blue' })
 readonly color: string;

 @ApiProperty({ example: ['6de9351c-82e6-4208-aca9-290b1ca3ed77', 'e3a0822b-3fc7-4608-8356-7ef1ca161f37'], required: false })
 readonly memberIds: string[] | null
}
