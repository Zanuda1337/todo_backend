import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { User } from '../users/users.model';
import { UserCategories } from './user-categories.model';
import { UsersModule } from '../users/users.module';
import { CategoriesGateway } from './categories.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [CategoriesService, CategoriesGateway],
  controllers: [CategoriesController],
  imports: [SequelizeModule.forFeature([Category, User, UserCategories]), UsersModule, JwtModule],
})
export class CategoriesModule {}
