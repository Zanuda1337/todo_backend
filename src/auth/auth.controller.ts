import {
  Body,
  Controller,
  Delete, Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse, ApiOperation, ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RtGuard } from './common/guards';
import {
  Cookies,
  GetCurrentUserId,
  Public,
} from './common/decorators';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { Response } from 'express';
import { User } from '../users/users.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiResponse({ status: 200, type: User, description: 'Успешно' })
  @ApiBearerAuth('access_token')
  @Get('/me')
  me(@GetCurrentUserId() userId: string) {
    return this.authService.me(userId);
  }

  @Post('/registration')
  @Public()
  @ApiConflictResponse({ status: HttpStatus.CONFLICT, description: 'Пользователь с таким Email уже существует', })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные', })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: 'Пользователь создан', })
  @HttpCode(HttpStatus.CREATED)

  async registration(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } = await this.authService.registration(
      userDto,
    );
    res.cookie('refresh_token', refresh_token, { httpOnly: true, domain: 'http://localhost:3000' });
    return { access_token };
  }

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() userDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const { access_token, refresh_token } = await this.authService.login(
      userDto,
    );
    res.cookie('refresh_token', refresh_token, { httpOnly: true, domain: 'http://localhost:3000' });
    return { access_token };
  }

  @Put('/refresh')
  @ApiOperation({ summary: 'Обновить refresh_token и получить новую пару токенов' })
  @Public()
  @UseGuards(RtGuard)
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookies('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.refresh(refreshToken);
    res.cookie('refresh_token', refresh_token, { httpOnly: true, domain: 'http://localhost:3000' });
    return { access_token };
  }

  @Delete('/logout')
  @ApiBearerAuth('access_token')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId) {
    console.log(userId)
    return this.authService.logout(userId);
  }
}
