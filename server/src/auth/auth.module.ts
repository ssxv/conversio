import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule ,UsersModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }
