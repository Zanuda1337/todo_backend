import {
  Body,
  Controller,
  Delete,
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
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RtGuard } from './common/guards';
import { Cookies, GetCurrentUser, Public } from './common/decorators';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    console.log(userDto)
    const { access_token, refresh_token } = await this.authService.registration(
      userDto,
    );
    res.cookie('refresh_token', refresh_token, { httpOnly: true });
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
    res.cookie('refresh_token', refresh_token, { httpOnly: true });
    return { access_token };
  }

  @Put('/refresh')
  @Public()
  @UseGuards(RtGuard)
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetCurrentUser() user,
    @Cookies('refresh_token') refreshToken: string,
  ) {
    return this.authService.refresh(user.id, refreshToken);
  }

  @Delete('/logout')
  @ApiBearerAuth('access_token')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser() user) {
    return this.authService.logout(user.id);
  }
}
