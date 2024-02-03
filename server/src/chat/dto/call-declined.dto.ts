import { User } from '@/users/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallDeclinedDto {

    @IsNotEmpty()
    @IsString()
    fromUserId: string;

    @IsNotEmpty()
    by: User;
}
