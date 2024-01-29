import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { ChatGateway } from "./chat.gateway";
import { MessagesModule } from "@/messages/message.module";
import { ChatService } from "./chat.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        MessagesModule,
        JwtModule,
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway, ChatService],
})
export class ChatModule { }