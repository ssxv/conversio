import { UsersService } from "@/users/user.service";
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { SKIP_AUTH } from "../decorator/skip-auth.decorator";

@Injectable()
export class AuthGuard implements CanActivate {

    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private userService: UsersService,

        private jwtService: JwtService,

        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAuth) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const bearerToken: string = request?.headers?.authorization;
        const token = bearerToken.substring(7);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const data = this.jwtService.verify(token);
            const email = data?.email;
            const existingUser = await this.userService.getUserByEmail(email);
            if (!existingUser) {
                throw new UnauthorizedException();
            }
            request['user'] = existingUser;
        } catch (err) {
            throw new UnauthorizedException('Failed to verify token');
        }
        return true;
    }
}