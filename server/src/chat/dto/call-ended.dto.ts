import { User } from '@/users/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallEndedDto {

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    @IsNotEmpty()
    by: User;
}
