import { IsNotEmpty, IsString } from "class-validator";

export class ReadMessageDto {

    @IsNotEmpty()
    @IsString()
    senderUserId: string;

    receiverUserId?: string;
}