import { UsersService } from "@/users/user.service";
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {

    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private userService: UsersService,

        private jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const bearerToken: string = request?.headers?.authorization;
        const token = bearerToken.substring(7);
        if (!token) {
            return false;
        }

        try {
            const data = this.jwtService.verify(token);
            const email = data?.email;
            const existingUser = await this.userService.getUserByEmail(email);
            if (!existingUser) {
                throw new UnauthorizedException();
            }
            request['user'] = existingUser;
            return true;
        } catch (err) {
            this.logger.error(`Failed to verify token`);
        }
        return false;
    }

}