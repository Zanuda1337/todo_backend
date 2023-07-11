import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task) private tasksRepository: typeof Task,
    private categoriesService: CategoriesService,
  ) {}

  async getAll(categoryId: string, userId: string) {
    const category = await this.categoriesService.getCategoryById(
      categoryId,
      userId,
    );
    if (!category) throw new NotFoundException('CATEGORY_DOESNT_EXIST');
    return await this.tasksRepository.findAll({
      where: { categoryId: category.id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  async create(dto: CreateTaskDto, currentUserId: string) {
    const task = await this.tasksRepository.create({
      categoryId: dto.categoryId,
      creatorId: currentUserId,
      text: dto.text,
    });
    const { id, creatorId, categoryId, text, isCompleted } = task;
    return { id, creatorId, categoryId, text, isCompleted };
  }
}
