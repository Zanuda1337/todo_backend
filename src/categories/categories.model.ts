import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { UserCategories } from './user-categories.model';
import { ApiProperty } from '@nestjs/swagger';

interface ICategoryCreationAttrs {
  name: string;
  color: string;
  creatorId: string;
  memberIds: string[] | null;
}

@Table({ tableName: 'categories' })
export class Category extends Model<Category, ICategoryCreationAttrs> {
  @ApiProperty({ example: 'e3a0822b-3fc7-4608-8356-7ef1ca161f37' })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'e3a0822b-3fc7-4608-8356-7ef1ca161f37' })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, unique: false })
  creatorId: string;

  @ApiProperty({ example: 'business' })
  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  name: string;

  @ApiProperty({ example: 'blue' })
  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  color: string;

  // @ApiProperty({ example: '2023-03-05T17:45:22.817Z'})
  createdAt: string;

  // @ApiProperty({ example: '2023-03-05T17:45:22.817Z'})
  updatedAt: string;

  @BelongsTo(() => User)
  creator: User;

  @ApiProperty({
    example: [{
      id: "0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f",
      email: "user@mail.ru",
      name: "joy",
      surname: "mitchell",
      picture: null
    }], isArray: true
  })
  @BelongsToMany(() => User, () => UserCategories)
  members: User[];
}
