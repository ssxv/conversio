import { Logger, UseGuards } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketAuthGuard } from "../app/guard/socket-auth.guard";
import { ClientTypingDto } from "./dto/client-typing.dto";
import { ChatService } from "./chat.service";
import { Message } from "@/messages/message.entity";
import { CHAT_EVENT } from "./chat.events";
import { ReadMessageDto } from "@/messages/dto/read-message.dto";
import { CallRequestDto } from "./dto/call-request.dto";

@UseGuards(SocketAuthGuard)
@WebSocketGateway({ namespace: 'socket' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    private readonly logger = new Logger(ChatGateway.name);

    @WebSocketServer() webSocketServer: Server;

    constructor(
        private chatService: ChatService,
    ) { }

    afterInit() {
        this.logger.log('WebSocketGateway initialised');
    }

    async handleConnection(client: Socket) {
        const user = await this.chatService.getCurrentUser(client);
        if (!user) {
            client.disconnect();
            return;
        }
        this.chatService.createActiveUser(user.id, client.id);
        this.webSocketServer.emit(CHAT_EVENT.CLIENT_CONNECTION, user);
    }

    async handleDisconnect(client: Socket) {
        const user = await this.chatService.getCurrentUser(client);
        if (!user) {
            client.disconnect();
            return;
        }
        this.chatService.deleteActiveUser(user.id);
        this.webSocketServer.emit(CHAT_EVENT.CLIENT_DISCONNECTION, user);
    }

    sendNewMessageEvent(message: Message) {
        this.logger.log(`emit NEW_MESSAGE for ${JSON.stringify(message, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(message.to))
            .emit(CHAT_EVENT.NEW_MESSAGE, message);
    }

    sendMessageReadEvent(dto: ReadMessageDto) {
        this.logger.log(`emit MESSAGE_READ for ${JSON.stringify(dto, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(dto.senderUserId))
            .emit(CHAT_EVENT.MESSAGE_READ, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CLIENT_TYPING)
    async handleClientTyping(@MessageBody() dto: ClientTypingDto) {
        this.logger.log(JSON.stringify(dto, null, 4));
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUserId))
            .emit(CHAT_EVENT.CLIENT_TYPING, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CALL_REQUEST)
    async handleIncomingCallRequest(@MessageBody() dto: CallRequestDto) {
        this.logger.log(JSON.stringify(dto, null, 4));
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUser.id))
            .emit(CHAT_EVENT.CALL_REQUEST, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CALL_DECLINED)
    async handleCallDeclined(@MessageBody() dto: CallRequestDto) {
        this.logger.log(JSON.stringify(dto, null, 4));
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUser.id))
            .emit(CHAT_EVENT.CALL_DECLINED, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CALL_ANSWERED)
    async handleCallAnswered(@MessageBody() dto: CallRequestDto) {
        this.logger.log(JSON.stringify(dto, null, 4));
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUser.id))
            .emit(CHAT_EVENT.CALL_ANSWERED, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CALL_ENDED)
    async handleCallEnded(@MessageBody() dto: CallRequestDto) {
        this.logger.log(JSON.stringify(dto, null, 4));
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUser.id))
            .emit(CHAT_EVENT.CALL_ENDED, dto);
    }
}
