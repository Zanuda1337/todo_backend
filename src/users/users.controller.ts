import { Controller, Delete, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './users.model';
import { GetCurrentUserId } from '../auth/common/decorators';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService,) {}

  @ApiOperation({summary: 'Получить всех пользователей'})
  @ApiResponse({status: 200, type: [User]})
  @ApiBearerAuth('access_token')
  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Get('pending')
  @ApiBearerAuth('access_token')
  getAllPending(@GetCurrentUserId() userId: string) {
    return this.usersService.getAllPending(userId)
  }
  @Get('outgoing')
  getAllOutgoing() {

  }
  @Get('friends')
  getAllFriends() {

  }

  @Post('friends/:id')
  addRelation() {

  }

  @Delete('friends/:id')
  deleteRelation() {

  }
}
