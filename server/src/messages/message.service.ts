import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessageDto } from './dto/get-messages.dto';
import { ChatGateway } from '@/chat/chat.gateway';
import { ReadMessageDto } from './dto/read-message.dto';
import { DATASOURCE_NAME } from '@/app/app.constant';

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Message, DATASOURCE_NAME)
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
        const { currentUserId, conversationWithUserId, fromDate, toDate } = dto;
        let { take } = dto;
        const whereCondition = [];
        if (!fromDate && !toDate) {
            whereCondition.push(
                { from: currentUserId, to: conversationWithUserId },
                { from: conversationWithUserId, to: currentUserId }
            );
        }
        if (fromDate && !toDate) {
            whereCondition.push(
                { from: currentUserId, to: conversationWithUserId, createdAt: MoreThan(fromDate) },
                { from: conversationWithUserId, to: currentUserId, createdAt: MoreThan(fromDate) }
            );
            take = null;
        }
        if (toDate && !fromDate) {
            whereCondition.push(
                { from: currentUserId, to: conversationWithUserId, createdAt: LessThan(toDate) },
                { from: conversationWithUserId, to: currentUserId, createdAt: LessThan(toDate) }
            );
            take = null;
        }
        if (fromDate && toDate) {
            whereCondition.push(
                { from: currentUserId, to: conversationWithUserId, createdAt: [MoreThan(fromDate), LessThan(toDate)] },
                { from: conversationWithUserId, to: currentUserId, createdAt: [MoreThan(fromDate), LessThan(toDate)] }
            );
            take = null;
        }
        return this.messageRepo.find({
            where: whereCondition,
            order: { createdAt: 'DESC' },
            take,
        });
    }

    async markMessagesRead(dto: ReadMessageDto) {
        const { senderUserId, receiverUserId } = dto;
        const res = await this.messageRepo.update({ from: senderUserId, to: receiverUserId, read: Not(true) }, { read: true });
        if (res.affected > 0) {
            this.chatGateway.sendMessageReadEvent(dto);
        } 
    }
}
