import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Category } from '../categories/categories.model';
import { UserCategories } from '../categories/user-categories.model';
import { AuthModule } from '../auth/auth.module';
import { Friendship } from './friendship.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([User, Category, UserCategories, Friendship]),
  ],
  exports: [UsersService],
})
export class UsersModule {}
