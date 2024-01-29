import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesController } from './message.controller';
import { MessagesService } from './message.service';
import { UsersModule } from '@/users/user.module';
import { ChatModule } from '@/chat/chat.module';
import { DATASOURCE_NAME } from '@/app/app.constant';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message], DATASOURCE_NAME),
        forwardRef(() => UsersModule),
        forwardRef(() => ChatModule),
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService],
})
export class MessagesModule { }
