import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { UserCategories } from './user-categories.model';
import { Sequelize } from 'sequelize-typescript';
import { FindAttributeOptions, GroupOption } from 'sequelize';
import { UpdateCategoryDto } from './dto/update-category,dto';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/tasks.model';

@Injectable()
export class CategoriesService {
  categoryAttrs: FindAttributeOptions;
  categoryGroup: GroupOption;
  constructor(
    private tasksService: TasksService,
    @InjectModel(Category) private categoryRepository: typeof Category,
    @InjectModel(UserCategories)
    private userCategoryRepository: typeof UserCategories,
    @InjectModel(Task)
    private tasksRepository: typeof Task,
  ) {
    this.categoryAttrs = [
      'category.id',
      'category.creatorId',
      'category.name',
      'category.color',
      [
        Sequelize.fn(
          'json_agg',
          Sequelize.fn(
            'json_build_object',
            'id',
            Sequelize.col('members.id'),
            'email',
            Sequelize.col('members.email'),
            'name',
            Sequelize.col('members.name'),
            'surname',
            Sequelize.col('members.surname'),
            'picture',
            Sequelize.col('members.picture'),
          ),
        ),
        'members',
      ],
    ];
    this.categoryGroup = [
      'category.id',
      'category.creatorId',
      'category.name',
      'category.color',
    ];
  }

  async create(dto: CreateCategoryDto, userId: string) {
    const category = await this.categoryRepository.create({
      name: dto.name,
      color: dto.color,
      creatorId: userId,
    });
    const memberIds = dto.memberIds ? [...dto.memberIds, userId] : [userId];
    await category.$set('members', memberIds);
    return await this.getCategoryById(category.id, userId);
  }

  async update(dto: UpdateCategoryDto, userId: string): Promise<any> {
    if (!dto.name && !dto.color && !dto.memberIds)
      throw new HttpException('NO_ARGUMENTS', HttpStatus.BAD_REQUEST);
    const category = await this.categoryRepository.findOne({
      where: { id: dto.id, creatorId: userId },
    });
    if (!category)
      throw new HttpException('CATEGORY_DOESNT_EXIST', HttpStatus.BAD_REQUEST);
    if (dto.name) category.name = dto.name;
    if (dto.color) category.color = dto.color;
    if (dto.memberIds) {
      const memberIds =
        dto.memberIds.length !== 0 ? [...dto.memberIds, userId] : [userId];
      await category.$set('members', memberIds);
    }
    await category.save();
    return await this.getCategoryById(category.id, userId);
  }

  async getCategoryById(id: string, userId: string) {
    const category = await this.userCategoryRepository.findOne({
      attributes: this.categoryAttrs,
      where: { categoryId: id },
      include: [
        { association: 'category', attributes: [], required: true },
        { association: 'members', attributes: [], required: true },
      ],
      raw: true,
      group: this.categoryGroup,
      having: Sequelize.literal(
        `bool_or(true) FILTER (WHERE "members"."id" = '${userId}')`,
      ),
      order: Sequelize.literal('category.id ASC'),
    });
    const tasks = await this.tasksRepository.findAll({
      where: { categoryId: category.id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    return {
      ...category,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.isCompleted).length,
    };
  }

  async getAll(id: string) {
    const categories = await this.userCategoryRepository.findAll({
      attributes: this.categoryAttrs,
      include: [
        {
          association: 'category',
          attributes: [],
          required: true,
        },
        { association: 'members', attributes: [], required: true },
      ],
      raw: true,
      group: this.categoryGroup,
      having: Sequelize.literal(
        `bool_or(true) FILTER (WHERE "members"."id"::text = '${id}')`,
      ),
      order: Sequelize.literal('category.id ASC'),
    });
    const categoryIds = categories.map((item) => item.id);
    const tasks = await this.tasksRepository.findAll({
      where: { categoryId: categoryIds },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    return categories.map((category) => {
      const categoryTasks = tasks?.filter(
        (task) => task.categoryId === category.id,
      );
      const completedTasks = categoryTasks?.filter((task) => task.isCompleted);
      return {
        ...category,
        totalTasks: categoryTasks.length,
        completedTasks: completedTasks.length,
      };
    });
  }
  async deleteCategory(userId: string, categoryId: string) {
    const category = await this.userCategoryRepository.findOne({
      attributes: this.categoryAttrs,
      where: { categoryId: categoryId },
      include: [
        { association: 'category', attributes: [], required: true },
        { association: 'members', attributes: [], required: true },
      ],
      raw: true,
      group: this.categoryGroup,
      having: Sequelize.literal(
        `bool_or(true) FILTER (WHERE "members"."id"::text = '${userId}')`,
      ),
    });
    if (!category)
      throw new HttpException('CATEGORY_DOESNT_EXIST', HttpStatus.BAD_REQUEST);
    await this.categoryRepository.destroy({ where: { id: category.id } });
  }
}
