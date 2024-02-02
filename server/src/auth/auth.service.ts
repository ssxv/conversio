import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSignupDto } from './dto/user-signup.dto';
import { UsersService } from '../users/user.service';
import { User } from '../users/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,

        private jwtService: JwtService,
    ) { }

    async signup(dto: UserSignupDto) {

        const existingUser = await this.usersService.getUserByEmail(dto.email);
        if (existingUser) {
            throw new ForbiddenException("User already exists");
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);

        const newUser = new User();
        newUser.name = dto.name;
        newUser.email = dto.email;
        newUser.hash = hash;
        newUser.salt = salt;

        const user = await this.usersService.createUser(newUser);
        return this.trimmedUser(user);
    }

    async login(dto: UserLoginDto) {

        const existingUser = await this.usersService.getUserByEmail(dto.email);
        if (!existingUser) {
            throw new NotFoundException("User does not exists");
        }

        const match = await bcrypt.compare(dto.password, existingUser.hash);
        if (!match) {
            throw new ForbiddenException("Email or password incorrect");
        }

        return this.trimmedUser(existingUser);
    }

    trimmedUser(user: User) {
        const token = this.jwtService.sign({ email: user.email });
        user.token = token;
        delete user.hash;
        delete user.salt;
        delete user.createdAt;
        delete user.modifiedAt;
        return user;
    }

}
