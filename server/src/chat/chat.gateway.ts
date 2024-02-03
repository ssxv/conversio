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
import { CallDeclinedDto } from "./dto/call-declined.dto";
import { CallAnsweredDto } from "./dto/call-answered.dto";
import { CallEndedDto } from "./dto/call-ended.dto";

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
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUserId))
            .emit(CHAT_EVENT.CLIENT_TYPING, dto);
    }

    @SubscribeMessage(CHAT_EVENT.CALL_REQUEST)
    async handleIncomingCallRequest(@MessageBody() dto: CallRequestDto) {
        this.logger.log(`got CALL_REQUEST with ${JSON.stringify({
            from: dto.from,
            toUserId: dto.toUserId,
        }, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUserId))
            .emit(CHAT_EVENT.CALL_REQUEST, {
                from: dto.from,
                signalData: dto.signalData,
            });
    }

    @SubscribeMessage(CHAT_EVENT.CALL_DECLINED)
    async handleCallDeclined(@MessageBody() dto: CallDeclinedDto) {
        this.logger.log(`got CALL_DECLINED with ${JSON.stringify(dto, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(dto.fromUserId))
            .emit(CHAT_EVENT.CALL_DECLINED, {
                by: dto.by,
            });
    }

    @SubscribeMessage(CHAT_EVENT.CALL_ANSWERED)
    async handleCallAnswered(@MessageBody() dto: CallAnsweredDto) {
        this.logger.log(`got CALL_ANSWERED with ${JSON.stringify({
            fromUserId: dto.fromUserId,
            by: dto.by,
        }, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(dto.fromUserId))
            .emit(CHAT_EVENT.CALL_ANSWERED, {
                signalData: dto.signalData,
            });
    }

    @SubscribeMessage(CHAT_EVENT.CALL_ENDED)
    async handleCallEnded(@MessageBody() dto: CallEndedDto) {
        this.logger.log(`got CALL_ENDED with ${JSON.stringify(dto, null, 4)}`);
        this.webSocketServer.to(this.chatService.getActiveUser(dto.toUserId))
            .emit(CHAT_EVENT.CALL_ENDED, {
                by: dto.by,
            });
    }
}
