import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessageDto } from './dto/get-messages.dto';
import { ChatGateway } from '@/chat/chat.gateway';
import { ReadMessageDto } from './dto/read-message.dto';

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,

        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) { }

    async createMessage(dto: CreateMessageDto) {
        const newMessage = new Message();
        newMessage.clientId = dto.clientId;
        newMessage.from = dto.fromUserId;
        newMessage.to = dto.toUserId;
        newMessage.message = dto.message;

        const message = await this.messageRepo.save(newMessage);
        this.chatGateway.sendNewMessageEvent(message);
        return message;
    }

    getMessages(dto: GetMessageDto) {
        const { forUserId, withUserId } = dto;
        return this.messageRepo.find({
            where: [
                { from: forUserId, to: withUserId },
                { from: withUserId, to: forUserId }
            ],
            order: {
                createdAt: 'DESC',
            },
            take: 50,
        });
    }

    async markMessagesRead(dto: ReadMessageDto) {
        const { toUserId, fromUserId } = dto;
        await this.messageRepo.update({ from: fromUserId, to: toUserId, read: Not(true) }, { read: true });
        this.chatGateway.sendMessageReadEvent(dto);
    }

}
