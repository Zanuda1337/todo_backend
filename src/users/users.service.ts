import { Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { Op, WhereOptions } from 'sequelize';
import { Friendship } from './friendship.model';

@Injectable()
export class UsersService {
  private readonly excludedAttrs: string[];
  constructor(@InjectModel(User) private userRepository: typeof User, @InjectModel(Friendship) private friendshipRepository: typeof Friendship) {
    this.excludedAttrs = ['createdAt', 'updatedAt'];
  }
  async create(dto: CreateUserDto) {
    return await this.userRepository.create(dto);
  }
  async getAll() {
    return await this.userRepository.findAll({
      attributes: { exclude: [...this.excludedAttrs, 'password', 'hashedRt'] },
    });
  }
  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      attributes: { exclude: this.excludedAttrs },
    });
  }

  async getAllPending(userId: string) {
    return await this.friendshipRepository.findAll({
      attributes: {exclude: ['id', 'senderId', 'recipientId', 'accepted']},
      include: { model: User, as: 'sender', nested: true }, where: [{recipientId: userId['id']}, {accepted: false}],
      raw: true
    })
  }

  async updateRtHash(id: string, hashedRt: string | null, isNotNull?: boolean) {
    const whereOptions: WhereOptions<User> = isNotNull
      ? { id, hashedRt: { [Op.ne]: null } }
      : { id };
    return await this.userRepository.update(
      { hashedRt },
      { where: whereOptions },
    );
  }

}
