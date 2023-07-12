import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { CategoriesService } from '../categories/categories.service';
import { UpdateTaskTextDto } from './dto/update-task-text.dto';

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

  async updateText(
    taskId: string,
    dto: UpdateTaskTextDto,
    currentUserId: string,
  ) {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('TASK_DOESNT_EXIST');
    const category = await this.categoriesService.getCategoryById(
      task.categoryId,
      currentUserId,
    );
    if (!category) throw new NotFoundException('TASK_DOESNT_EXIST');
    task.text = dto.text;
    await task.save();
    const { id, creatorId, categoryId, text, isCompleted } = task;
    return { id, creatorId, categoryId, text, isCompleted };
  }

  async updateStatus(taskId: string, currentUserId: string) {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('TASK_DOESNT_EXIST');
    const category = await this.categoriesService.getCategoryById(
      task.categoryId,
      currentUserId,
    );
    if (!category) throw new NotFoundException('TASK_DOESNT_EXIST');
    task.isCompleted = !task.isCompleted;
    await task.save();
    const { id, creatorId, categoryId, text, isCompleted } = task;
    return { id, creatorId, categoryId, text, isCompleted };
  }

  async delete(ids: string, currentUserId: string) {
    if(!TasksService.isJson(ids)) throw new BadRequestException('SHOULD_BE_JSON_ARRAY');
    const normalizedIds: string[] = JSON.parse(ids);
    if (!Array.isArray(normalizedIds))
      throw new BadRequestException('SHOULD_BE_JSON_ARRAY');
    const task = await this.tasksRepository.findOne({
      where: { id: normalizedIds[0] },
    });
    if(!task) throw new NotFoundException('TASK_DOESNT_EXIST')
    const tasks = await this.getAll(task.categoryId, currentUserId);
    tasks.forEach((item) => {
      if(!normalizedIds.includes(item.id))
        throw new NotFoundException('TASK_DOESNT_EXIST')
    });
    await this.tasksRepository.destroy({ where: { id: normalizedIds } });
  }
  private static isJson(item) {
    let value = typeof item !== "string" ? JSON.stringify(item) : item;
    try {
      value = JSON.parse(value);
    } catch (e) {
      return false;
    }

    return typeof value === "object" && value !== null;
  }
}
