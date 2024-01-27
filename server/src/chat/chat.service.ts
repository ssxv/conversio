import { UsersService } from "@/users/user.service";
import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {

    private readonly logger = new Logger(ChatService.name);

    // map of user.id and client.id
    private activeUserMap: { [userId: string]: string } = {};

    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,

        private jwtService: JwtService,
    ) { }

    async getCurrentUser(client: Socket) {
        const token: any = client?.handshake?.query?.token;

        if (token) {
            try {
                const data = this.jwtService.verify(token);
                const email = data?.email;
                return this.userService.getUserByEmail(email);
            } catch (err) {
                this.logger.error(`Failed to verify token`);
            }
        }
    }

    createActiveUser(userId: string, clientId: string) {
        this.activeUserMap[userId] = clientId;
    }

    getActiveUsers(...userIds: string[]): string[] {
        return userIds.map(userId => this.activeUserMap[userId]);
    }

    getActiveUser(userId: string): string {
        return this.activeUserMap[userId];
    }

    deleteActiveUser(userId: string) {
        delete this.activeUserMap[userId];
    }
}
