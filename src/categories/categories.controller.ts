import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './categories.model';
import { GetCurrentUserId } from '../auth/common/decorators';
import { UpdateCategoryDto } from './dto/update-category,dto';

@ApiTags('categories')
@Controller('/categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @HttpCode(201)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Создание категории' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Category })
  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.categoryService.create(dto, currentUserId);
  }

  @HttpCode(200)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Обновление категории' })
  @ApiResponse({ status: HttpStatus.OK, type: Category })
  @Patch()
  update(
    @Body() dto: UpdateCategoryDto,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.categoryService.update(dto, currentUserId);
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Получить категорию текущего пользователя по id' })
  @ApiResponse({ status: HttpStatus.OK, type: Category })
  @Get('/:id')
  getOne(@Param('id') id: string, @GetCurrentUserId() currentUserId: string) {
    return this.categoryService.getCategoryById(id, currentUserId);
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary:
      'Получить все категории пользователя, включая те, в которые он приглашен',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [Category] })
  @Get()
  getAll(@GetCurrentUserId() currentUserId: string) {
    return this.categoryService.getAll(currentUserId);
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Удалить категории по id',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiBadRequestResponse({
    description: 'CATEGORY_DOESNT_EXIST - категории с таким id не существуют',
  })
  @Delete('/:id')
  delete(
    @Param('id') id: string,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.categoryService.deleteCategory(currentUserId, id);
  }
}
