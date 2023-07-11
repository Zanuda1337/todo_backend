import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post, Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GetCurrentUserId } from '../auth/common/decorators';
import { Task } from './tasks.model';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { Category } from '../categories/categories.model';
import { UpdateCategoryDto } from '../categories/dto/update-category,dto';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('tasks')
@Controller('/')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить все задания в категории' })
  @ApiResponse({ status: 200, type: [Task], description: 'Успешно' })
  @ApiBearerAuth('access_token')
  @Get('categories/:id/tasks')
  getTasks(@Param('id') categoryId: string, @GetCurrentUserId() userId: string) {
    return this.tasksService.getAll(categoryId, userId);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Создание задачи' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Task })
  @Post("tasks/")
  create(
    @Body() dto: CreateTaskDto,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.tasksService.create(dto, currentUserId);
  }
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth('access_token')
  // @ApiOperation({ summary: 'Изменить текст задачи' })
  // @ApiResponse({ status: HttpStatus.OK, type: Task })
  // @Put('tasks/:id/text')
  // updateText(
  //   @Body() dto: UpdateCategoryDto,
  //   @GetCurrentUserId() currentUserId: string,
  // ) {
  //   // return this.categoryService.update(dto, currentUserId);
  // }
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth('access_token')
  // @ApiOperation({ summary: 'Изменить статус выполнения задачи' })
  // @ApiResponse({ status: HttpStatus.OK, type: Task })
  // @Put('tasks/:id/completed')
  // updateStatus(
  //   @Body() dto: UpdateCategoryDto,
  //   @GetCurrentUserId() currentUserId: string,
  // ) {
  //   // return this.categoryService.update(dto, currentUserId);
  // }
  //
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth('access_token')
  // @ApiOperation({ summary: 'Удалить задачи' })
  // @ApiResponse({ status: HttpStatus.OK})
  // @Delete('tasks/:ids')
  // delete(
  //   @Param('ids') ids: string,
  //   @GetCurrentUserId() currentUserId: string,
  // ) {
  //   // return this.categoryService.deleteCategory(currentUserId, id);
  // }
}
