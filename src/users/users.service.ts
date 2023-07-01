import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { Op, WhereOptions } from 'sequelize';
import { Friendship } from './friendship.model';
import { Sequelize } from 'sequelize-typescript';
import { Col } from 'sequelize/types/utils';

@Injectable()
export class UsersService {
  private readonly excludedAttrs: string[];
  private readonly senderAttrs: string[];
  private readonly recipientAttrs: string[];
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Friendship) private friendshipRepository: typeof Friendship,
  ) {
    this.excludedAttrs = ['createdAt', 'updatedAt'];
    this.senderAttrs = [
      'sender.id',
      'sender.email',
      'sender.name',
      'sender.surname',
      'sender.picture',
    ];
    this.recipientAttrs = [
      'recipient.id',
      'recipient.email',
      'recipient.name',
      'recipient.surname',
      'recipient.picture',
    ];
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
      attributes: { exclude: [...this.excludedAttrs, 'password', 'hashedRt'] },
    });
  }
  async getUserByIdWithRt(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      attributes: { exclude: [...this.excludedAttrs, 'password'] },
    });
  }

  async getAllPending(userId: string) {
    return await this.friendshipRepository.findAll({
      attributes: {
        include: this.getWithoutPrefixAttrs(this.senderAttrs),
        exclude: ['id', 'senderId', 'recipientId', 'accepted'],
      },
      include: {
        attributes: [],
        model: User,
        as: 'sender',
      },
      raw: true,
      where: [{ recipientId: userId }, { accepted: false }],
    });
  }

  async getAllOutgoing(userId: string) {
    return await this.friendshipRepository.findAll({
      attributes: {
        include: this.getWithoutPrefixAttrs(this.recipientAttrs),
        exclude: ['id', 'recipientId', 'senderId', 'accepted'],
      },
      include: {
        attributes: [],
        association: 'recipient',
        on: Sequelize.literal('"Friendship"."recipientId" = "recipient"."id"'),
      },
      raw: true,
      where: [{ senderId: userId }, { accepted: false }],
    });
  }

  async getUsers(userId: string) {
    return await this.friendshipRepository.findAll({
      attributes: {
        include: [
          ...this.getWithoutPrefixAttrs([
            ...this.recipientAttrs,
            ...this.senderAttrs,
          ]),
          [
            Sequelize.literal(
              `CASE WHEN "Friendship"."recipientId" = '91a75d07-774d-420e-8b57-339f08ab4a2c' AND "Friendship"."accepted" = false THEN 'pending'WHEN "Friendship"."senderId" = '91a75d07-774d-420e-8b57-339f08ab4a2c' AND "Friendship"."accepted" = false THEN 'outgoing'WHEN "Friendship"."senderId" = '91a75d07-774d-420e-8b57-339f08ab4a2c' OR "Friendship"."recipientId" = '91a75d07-774d-420e-8b57-339f08ab4a2c' AND "Friendship"."accepted" = true THEN 'friends' END`,
            ),
            'status',
          ],
        ],
        exclude: ['id', 'recipientId', 'senderId', 'accepted'],
      },
      include: {
        attributes: [],
        all: true,
      },
      raw: true,
      where: [
        {
          [Op.or]: [
            { recipientId: { [Op.eq]: userId } },
            { senderId: { [Op.eq]: userId } },
          ],
        },
      ],
    });
  }

  async addRelation(myId: string, email: string) {
    const user = await this.getUserByEmail(email);
    if (!user)
      throw new HttpException('USER_DOESNT_EXIST', HttpStatus.NOT_FOUND);
    if (myId === user.id)
      throw new HttpException('SELF_FRIEND_REQUEST', HttpStatus.BAD_REQUEST);
    const relation = await this.findRelationWithUsers(myId, user.id);
    if (relation) {
      if (relation.accepted)
        throw new HttpException('ALREADY_FRIENDS', HttpStatus.CONFLICT);
      if (relation.senderId === myId)
        throw new HttpException('ALREADY_SENT', HttpStatus.CONFLICT);
      throw new HttpException('ALREADY_RECEIVED', HttpStatus.CONFLICT);
    }
    await this.friendshipRepository.create({
      senderId: myId,
      recipientId: user.id,
    });
  }

  async acceptRelation(myId: string, userId: string) {
    if (myId === userId)
      throw new HttpException('INCORRECT_DATA', HttpStatus.BAD_REQUEST);
    const relation = await this.friendshipRepository.findOne({
      where: [{ recipientId: myId }, { senderId: userId }],
    });
    if (!relation)
      throw new HttpException('RELATION_DOESNT_EXIST', HttpStatus.NOT_FOUND);
    if (relation.accepted)
      throw new HttpException('ALREADY_FRIENDS', HttpStatus.CONFLICT);
    relation.accepted = true;
    await relation.save();
  }

  async deleteRelation(myId: string, userId: string) {
    if (myId === userId)
      throw new HttpException('INCORRECT_DATA', HttpStatus.BAD_REQUEST);
    const relation = await this.friendshipRepository.findOne({
      where: {
        senderId: {
          [Op.or]: [{ [Op.eq]: userId }, { [Op.eq]: myId }],
        },
        recipientId: {
          [Op.or]: [{ [Op.eq]: userId }, { [Op.eq]: myId }],
        },
      },
    });
    if (!relation)
      throw new HttpException('RELATION_DOESNT_EXIST', HttpStatus.NOT_FOUND);
    await relation.destroy();
  }

  private async findRelationWithUsers(senderId, recipientId) {
    return await this.friendshipRepository.findOne({
      where: [
        {
          senderId: {
            [Op.or]: [{ [Op.eq]: senderId }, { [Op.eq]: recipientId }],
          },
          recipientId: {
            [Op.or]: [{ [Op.eq]: senderId }, { [Op.eq]: recipientId }],
          },
        },
      ],
    });
  }

  private getWithoutPrefixAttrs(attrs: string[]): [Col, string][] {
    return attrs.map((attr) => [Sequelize.col(attr), attr.split('.')[1]]);
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
