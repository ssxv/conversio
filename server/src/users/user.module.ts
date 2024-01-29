import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { ChatModule } from '@/chat/chat.module';
import { DATASOURCE_NAME } from '@/app/app.constant';

@Module({
    imports: [
        TypeOrmModule.forFeature([User], DATASOURCE_NAME),
        forwardRef(() => ChatModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
