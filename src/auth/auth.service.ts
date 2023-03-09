import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registration(dto: CreateUserDto): Promise<Tokens> {
    const candidate = await this.usersService.getUserByEmail(dto.email);
    if (candidate) {
      throw new HttpException('USER_ALREADY_EXISTS', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await AuthService.hashData(dto.password);
    const user = await this.usersService.create({
      ...dto,
      password: hashPassword,
    });
    const tokens = await this.generateTokens(user);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async login(dto: LoginUserDto): Promise<Tokens> {
    const user = await this.validateUser(dto);
    const tokens = await this.generateTokens(user);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    await this.clearRtHash(userId);
  }

  async refresh(userId: string, rt: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user || !user.hashedRt) throw new ForbiddenException('ACCESS_DENIED');
    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('ACCESS_DENIED');
    const tokens = await this.generateTokens(user);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const payload = { id: user.id, email: user.email };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        // expiresIn: 60 * 15,
        expiresIn: 60 * 60 * 24,
        secret: process.env.AT_SECRET,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7,
        secret: process.env.RT_SECRET,
      }),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  private async validateUser(dto: LoginUserDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
    const passwordEquals = await bcrypt.compare(dto.password, user.password);
    if (user && passwordEquals) {
      return user;
    }
    throw new ForbiddenException({ message: 'INCORRECT_EMAIL_OR_PASSWORD' });
  }

  private static async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 10);
  }

  private async updateRtHash(userId: string, rt: string, isNotNull?: boolean) {
    const hash = await AuthService.hashData(rt);
    await this.usersService.updateRtHash(userId, hash, isNotNull);
  }
  private async clearRtHash(userId: string) {
    await this.usersService.updateRtHash(userId, null, true);
  }
}
