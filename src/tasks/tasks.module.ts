import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { forwardRef, Module } from '@nestjs/common';
import { Task } from './tasks.model';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [forwardRef(() => CategoriesModule), SequelizeModule.forFeature([Task]), ],
})
export class TasksModule {}
