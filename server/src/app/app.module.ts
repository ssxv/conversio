import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { Message } from '@/messages/message.entity';
import { MessagesModule } from '@/messages/message.module';
import { AuthGuard } from './guard/auth.guard';
import { DATASOURCE_NAME } from './app.constant';
import { UsersModule } from '@/users/user.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: DATASOURCE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERANME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_DBNAME'),
        entities: [User, Message],
        synchronize: configService.get('DATABASE_SYNC') === 'true',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRY'),
        },
      }),
    }),
    AuthModule,
    ChatModule,
    UsersModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule { }
