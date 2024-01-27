import { IsNotEmpty, IsString } from 'class-validator';

export class ClientMessageDto {

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    fromUserId?: string;
}
