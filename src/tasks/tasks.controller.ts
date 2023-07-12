import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiNotFoundResponse,
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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskTextDto } from './dto/update-task-text.dto';

@ApiTags('tasks')
@Controller('/')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить все задания в категории' })
  @ApiResponse({ status: 200, type: [Task], description: 'Успешно' })
  @ApiNotFoundResponse({description: 'CATEGORY_DOESNT_EXIST'})
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Изменить текст задачи' })
  @ApiResponse({ status: HttpStatus.OK, type: Task })
  @ApiNotFoundResponse({description: 'TASK_DOESNT_EXIST'})
  @Put('tasks/:id/text')
  updateText(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskTextDto,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.tasksService.updateText(taskId, dto, currentUserId);
  }
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Переключить статус выполнения задачи' })
  @ApiResponse({ status: HttpStatus.OK, type: Task })
  @ApiNotFoundResponse({description: 'TASK_DOESNT_EXIST'})
  @Put('tasks/:id/completed')
  updateStatus(
    @Param('id') taskId: string,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.tasksService.updateStatus(taskId, currentUserId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Удалить задачи' })
  @ApiResponse({ status: HttpStatus.OK})
  @ApiBadRequestResponse({description: 'SHOULD_BE_JSON_ARRAY'})
  @ApiNotFoundResponse({description: 'TASK_DOESNT_EXIST'})
  @Delete('tasks/:ids')
  delete(
    @Param('ids') ids: string,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.tasksService.delete(ids,currentUserId);
  }
}
