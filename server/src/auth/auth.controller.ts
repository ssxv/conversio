import { Controller, Logger, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { SkipAuth } from '@/app/decorator/skip-auth.decorator';

@Controller('auth')
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(
        private authService: AuthService,
    ) { }

    @SkipAuth()
    @Post('/sign-up')
    signup(@Body(new ValidationPipe({ transform: true })) dto: UserSignupDto) {
        return this.authService.signup(dto);
    }

    @SkipAuth()
    @Post('/login')
    login(@Body(new ValidationPipe({ transform: true })) dto: UserLoginDto) {
        return this.authService.login(dto);
    }
}
