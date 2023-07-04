import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if(!request.cookies?.[data]) return ''
    return data ? request.cookies?.[data] : request.cookies;
  },
);
