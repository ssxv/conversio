import { User } from '@/users/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallRequestDto {

    @IsNotEmpty()
    from: User;

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    @IsNotEmpty()
    signalData: any;
}
