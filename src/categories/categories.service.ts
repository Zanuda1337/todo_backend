import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { UserCategories } from './user-categories.model';
import { Sequelize } from 'sequelize-typescript';
import { FindAttributeOptions, GroupOption, Op } from 'sequelize';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';

@Injectable()
export class CategoriesService {
  categoryAttrs: FindAttributeOptions;
  categoryGroup: GroupOption;
  constructor(
    @InjectModel(Category) private categoryRepository: typeof Category,
    @InjectModel(UserCategories)
    private userCategoryRepository: typeof UserCategories,
    private userService: UsersService,
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

  async create(dto: CreateCategoryDto) {
    const category = await this.categoryRepository.create({
      name: dto.name,
      color: dto.color,
      creatorId: '0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f',
    });
    const memberIds = dto.memberIds
      ? [...dto.memberIds, '0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f']
      : ['0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f'];
    await category.$set('members', memberIds);
    return category;
  }

  async getCategoryById(id: string) {
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
        `bool_or(true) FILTER (WHERE "members"."id" = ${'0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f'})`,
      ),
      order: Sequelize.literal('category.id ASC'),
    });
    return category;
  }

  async getAll() {
    return  await this.userCategoryRepository.findAll({
      attributes: this.categoryAttrs,
      include: [
        { association: 'category', attributes: [], required: true },
        { association: 'members', attributes: [], required: true },
      ],
      raw: true,
      group: this.categoryGroup,
      having: Sequelize.literal(
        `bool_or(true) FILTER (WHERE "members"."id"::text = '${'0ca7c5a5-42eb-4a79-bcbc-b1c3ed76623f'}')`,
      ),
      order: Sequelize.literal('category.id ASC'),
    });
  }
}
