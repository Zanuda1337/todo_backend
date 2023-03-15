import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './categories.model';

@ApiTags('categories')
@Controller('/categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Создание категории' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Category })
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Получить категорию текущего пользователя по id' })
  @ApiResponse({ status: HttpStatus.OK, type: Category })
  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary:
      'Получить все категории пользователя, включая те, в которые он приглашен',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [Category] })
  @Get()
  getAll() {
    return this.categoryService.getAll();
  }
}
