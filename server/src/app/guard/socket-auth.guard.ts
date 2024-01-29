import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/user.service";

@Injectable()
export class SocketAuthGuard implements CanActivate {

    private readonly logger = new Logger(SocketAuthGuard.name);

    constructor(
        private userService: UsersService,

        private jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();

        const token = request?.handshake?.query?.token;
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