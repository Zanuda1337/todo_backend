import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Category } from './categories.model';

// interface IUserCategoriesCreationAttrs {
//   categoryId: string;
//   userId: string;
// }

@Table({ tableName: 'user_categories', createdAt: false, updatedAt: false })
export class UserCategories extends Model<
  UserCategories
  // ,IUserCategoriesCreationAttrs
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, unique: false })
  categoryId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, unique: false })
  userId: string;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsTo(() => User, {onUpdate: 'CASCADE', onDelete: "CASCADE", hooks: true})
  members: User[];
}
