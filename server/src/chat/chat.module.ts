import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { ChatGateway } from "./chat.gateway";
import { MessagesModule } from "@/messages/message.module";
import { ChatService } from "./chat.service";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        MessagesModule,
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway, ChatService],
})
export class ChatModule { }