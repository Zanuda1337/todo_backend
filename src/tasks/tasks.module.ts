import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { forwardRef, Module } from '@nestjs/common';
import { Task } from './tasks.model';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [
    SequelizeModule.forFeature([Task]),
    forwardRef(() => CategoriesModule),
  ],
  exports: [TasksService],
})
export class TasksModule {}
