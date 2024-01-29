import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '@/app/decorator/current-user.decorator';
import { User } from '@/users/user.entity';
import { GetMessageDto } from './dto/get-messages.dto';
import { ReadMessageDto } from './dto/read-message.dto';

@Controller('/messages')
export class MessagesController {

  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  createMessages(@Body(new ValidationPipe({ transform: true })) dto: CreateMessageDto, @CurrentUser() currentUser: User) {
    dto.fromUserId = currentUser.id;
    return this.messagesService.createMessage(dto);
  }

  @Get()
  getMessages(@Query(new ValidationPipe({ transform: true })) dto: GetMessageDto, @CurrentUser() currentUser: User) {
    dto.currentUserId = currentUser.id;
    return this.messagesService.getMessages(dto);
  }

  @Post('/read')
  markMessagesRead(@Body(new ValidationPipe({ transform: true })) dto: ReadMessageDto, @CurrentUser() currentUser: User) {
    dto.receiverUserId = currentUser.id;
    return this.messagesService.markMessagesRead(dto);
  }
}
