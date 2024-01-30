import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { ChatGateway } from "./chat.gateway";
import { MessagesModule } from "@/messages/message.module";
import { ChatService } from "./chat.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        MessagesModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRY'),
                },
            }),
        }),
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway, ChatService],
})
export class ChatModule { }