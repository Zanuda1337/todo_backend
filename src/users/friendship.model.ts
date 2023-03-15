import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './users.model';

interface friendshipCreationAttrs {
  senderId: string;
  recipientId: string
}

@Table({ tableName: 'friendship', createdAt: false, updatedAt: false })
export class Friendship extends Model<Friendship, friendshipCreationAttrs> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, unique: false })
  senderId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, unique: false })
  recipientId: string;

  @Column({ type: DataType.BOOLEAN, unique: false, defaultValue: false, allowNull: false })
  accepted: boolean;

  @BelongsTo(() => User, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  sender: User
  @BelongsTo(() => User, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  recipient: User

}
