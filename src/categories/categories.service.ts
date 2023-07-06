import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { UserCategories } from './user-categories.model';
import { Sequelize } from 'sequelize-typescript';
import { FindAttributeOptions, GroupOption } from 'sequelize';
import { UpdateCategoryDto } from './dto/update-category,dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoriesService {
  categoryAttrs: FindAttributeOptions;
  categoryGroup: GroupOption;
  constructor(
    @InjectModel(Category) private categoryRepository: typeof Category,
    @InjectModel(UserCategories)
    private userCategoryRepository: typeof UserCategories,
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
    return await this.userCategoryRepository.findOne({
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
  }

  async getAll(id: string) {
    return await this.userCategoryRepository.findAll({
      attributes: this.categoryAttrs,
      include: [
        { association: 'category', attributes: [], required: true },
        { association: 'members', attributes: [], required: true },
      ],
      raw: true,
      group: this.categoryGroup,
      having: Sequelize.literal(
        `bool_or(true) FILTER (WHERE "members"."id"::text = '${id}')`,
      ),
      order: Sequelize.literal('category.id ASC'),
    });
  }
  async deleteCategories(userId: string, dto: DeleteCategoryDto) {
    const categories = await this.userCategoryRepository.findAll({
      attributes: this.categoryAttrs,
      where: { categoryId: dto.categoryIds },
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
    const ids =  categories.map(c => c.id);
    if(!ids.length) throw new HttpException('CATEGORIES_DOESNT_EXIST', HttpStatus.BAD_REQUEST)
    await this.categoryRepository.destroy({where: {id: ids}})
  }
}
