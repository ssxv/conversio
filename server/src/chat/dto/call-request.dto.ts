import { User } from '@/users/user.entity';
import { IsNotEmpty } from 'class-validator';

export class CallRequestDto {

    @IsNotEmpty()
    fromUser: User;

    @IsNotEmpty()
    toUser: User;

    signalData?: any;
}
