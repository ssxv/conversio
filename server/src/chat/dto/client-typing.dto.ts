import { IsNotEmpty, IsString } from 'class-validator';

export class ClientTypingDto {

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    fromUserId?: string;
}
