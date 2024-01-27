import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/user.entity';

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req?.user;
});
