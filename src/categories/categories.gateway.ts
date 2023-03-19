import {
  OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import {Namespace} from 'socket.io'
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SocketWithAuth } from '../auth/common/types';

@WebSocketGateway({
  namespace: 'categories',
})
export class CategoriesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private readonly logger = new Logger(CategoriesGateway.name);

  @WebSocketServer() io: Namespace;

  afterInit(): void {
  }

  handleConnection(client: SocketWithAuth, ...args: any[]): any {
    const sockets = this.io.sockets;

    this.logger.debug(`Socket connected with UserId: ${client.userId}, email: ${client.email}`)

    this.logger.log(`WS Client with id: ${client.id} connected!`)
    this.logger.debug(`Number of connected sockets: ${sockets.size}`)

    this.io.emit('hello', `from ${client.id}`)
  }

  handleDisconnect(client: SocketWithAuth): any {
    const sockets = this.io.sockets

    this.logger.debug(`Socket disconnected with UserId: ${client.userId}, email: ${client.email}`)

    this.logger.log(`Disconnected socket id: ${client.id} connected!`)
    this.logger.debug(`Number of connected sockets: ${sockets.size}`)
  }
}

export const createTokenMiddleware = (jwtService: JwtService, logger: Logger) => (socket: SocketWithAuth, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['token'];

  logger.debug(`Validating auth token before connection: ${token}`);
  
  try {
    const payload = jwtService.verify(token, {secret: process.env.AT_SECRET})
    socket.userId = payload.id;
    socket.email = payload.email;
    next();
  }
  catch (e) {
    next(new Error('UNAUTHORIZED'))
  }
}
