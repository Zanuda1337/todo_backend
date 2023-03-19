import { Socket } from 'socket.io';

export type Tokens = {
  access_token: string;
  refresh_token: string;
}

export type AuthPayload = {
  userId: string;
  email: string;
}

export type SocketWithAuth = Socket & AuthPayload
