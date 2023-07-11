import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../categories/categories.model';
import { User } from '../users/users.model';


interface ITaskCreationAttrs {
  text: string;
  creatorId: string;
  categoryId: string;
}

@Table({ tableName: 'tasks' })
export class Task extends Model<Task, ITaskCreationAttrs> {
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

  @ApiProperty({ example: 'e3a0822b-3fc7-4608-8356-7ef1ca161f37' })
  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: false, unique: false })
  categoryId: string;

  @ApiProperty({ example: 'Pay for rent' })
  @Column({ type: DataType.STRING, allowNull: false, unique: false })
  text: string;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, unique: false, defaultValue: false })
  isCompleted: boolean;

  @BelongsTo(() => User)
  creator: User;
  @BelongsTo(() => Category)
  category: Category;
}
