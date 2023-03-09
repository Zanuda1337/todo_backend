import {
  BelongsToMany,
  Column,
  DataType, ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UserCategories } from '../categories/user-categories.model';
import { Category } from '../categories/categories.model';
import { Friendship } from './friendship.model';

interface IUserCreationAttrs {
  email: string;
  name: string;
  surname: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, IUserCreationAttrs> {
  @ApiProperty({ example: 'e3a0822b-3fc7-4608-8356-7ef1ca161f37' })
  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'user@mail.ru' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({ example: 'joy' })
  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  name: string;

  @ApiProperty({ example: 'mitchell' })
  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  surname: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  password: string;

  @ApiProperty({ example: 'photo', required: false, type:  'string | null'})
  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  picture: string | null;

  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  hashedRt: string | null;

  @BelongsToMany(() => Category, () => UserCategories, )
  categories: Category[];

  @BelongsToMany(() => User, () => Friendship, 'senderId', 'recipientId' )
  relations: User[]

}
