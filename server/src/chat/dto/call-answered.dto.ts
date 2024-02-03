import { User } from '@/users/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallAnsweredDto {

    @IsNotEmpty()
    @IsString()
    fromUserId: string;

    @IsNotEmpty()
    by: User;

    @IsNotEmpty()
    signalData: any;
}
