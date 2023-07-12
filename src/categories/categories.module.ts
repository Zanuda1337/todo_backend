import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserCategories } from './user-categories.model';
import { CategoriesGateway } from './categories.gateway';
import { TasksModule } from '../tasks/tasks.module';
import { Category } from './categories.model';
import { Task } from '../tasks/tasks.model';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesGateway],
  imports: [
    SequelizeModule.forFeature([Category, UserCategories, Task]),
    forwardRef(() => TasksModule),
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
