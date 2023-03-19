import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { createTokenMiddleware } from '../categories/categories.gateway';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name)
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const jwtService = this.app.get(JwtService)
    const server:Server =  super.createIOServer(port, options);
    server.of('categories').use(createTokenMiddleware(jwtService, this.logger))
    return server
  }
}
