import { IsNotEmpty, IsString } from 'class-validator';
import { UserLoginDto } from './user-login.dto';

export class UserSignupDto extends UserLoginDto {

    @IsNotEmpty()
    @IsString()
    name: string;

}