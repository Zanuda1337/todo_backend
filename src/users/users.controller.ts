import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation, ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './users.model';
import { GetCurrentUserId } from '../auth/common/decorators';
import { FindByEmailParam } from './types/findByEmailParam';
import { FindByIdParam } from '../auth/common/types/findByIdParam';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(200)
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @ApiBearerAuth('access_token')
  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Получить всех пользователей, которые отправили вам заявку в друзья' })
  @ApiResponse({ status: 200, type: [User], description: 'Успешно' })
  @ApiBearerAuth('access_token')
  @Get('pending')
  getAllPending(@GetCurrentUserId() userId: string) {
    return this.usersService.getAllPending(userId);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Получить всех пользователей, которым вы отправили заявку в друзья' })
  @ApiResponse({ status: 200, type: [User], description: 'Успешно' })
  @ApiBearerAuth('access_token')
  @Get('outgoing')
  getAllOutgoing(@GetCurrentUserId() userId: string) {
    return this.usersService.getAllOutgoing(userId);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Получить всех своих друзей' })
  @ApiResponse({ status: 200, type: [User], description: 'Успешно' })
  @ApiBearerAuth('access_token')
  @Get('friends')
  getAllFriends(@GetCurrentUserId() userId: string) {
    return this.usersService.getFriends(userId);
  }

  @ApiOperation({ summary: 'Отправить заявку в друзья' })
  @ApiBearerAuth('access_token')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Успешно' })
  @ApiNotFoundResponse({
    description: 'USER_DOESNT_EXIST - пользователь не существует',
  })
  @ApiBadRequestResponse({
    description: 'SELF_FRIEND_REQUEST - попытка добавить в друзья самого себя',
  })
  @ApiParam({name: 'email'})
  @ApiConflictResponse({
    description:
      'ALREADY_FRIENDS - пользователь уже является другом, ALREADY_SENT - запрос на дружбу уже отправлен, ALREADY_RECEIVED - запрос на дружбу уже получен',
  })
  @Post('friends/:email')
  addFriend(
    @Param() { email }: FindByEmailParam,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.usersService.addRelation(currentUserId, email);
  }
  @ApiOperation({ summary: 'Принять заявку в друзья' })
  @HttpCode(204)
  @ApiParam({name: 'id'})
  @ApiBearerAuth('access_token')
  @Put('friends/:id')
  @ApiResponse({ status: 204, description: 'Успешно' })
  @ApiBadRequestResponse({
    description: 'INCORRECT_DATA - некорректные данные',
  })
  @ApiNotFoundResponse({
    description:
      'RELATION_DOESNT_EXIST - запроса в друзья от такого пользователя не существует',
  })
  @ApiConflictResponse({
    description: 'ALREADY_FRIENDS - пользователь уже является другом',
  })
  acceptFriendship(
    @Param() { id }: FindByIdParam,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.usersService.acceptRelation(currentUserId, id);
  }

  @ApiOperation({
    summary:
      'Удалить из друзей / отклонить заявку в друзья / отменить заявку в друзья',
  })
  @ApiParam({name: 'id'})
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Успешно' })
  @ApiBadRequestResponse({
    description: 'INCORRECT_DATA - некорректные данные',
  })
  @ApiBearerAuth('access_token')
  @Delete('friends/:id')
  deleteFriend(
    @Param() { id }: FindByIdParam,
    @GetCurrentUserId() currentUserId: string,
  ) {
    return this.usersService.deleteRelation(currentUserId, id);
  }
}
