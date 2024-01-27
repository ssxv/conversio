import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {

    @IsNotEmpty()
    @IsString()
    clientId: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    toUserId: string;

    fromUserId?: string;
}
