import { IsNotEmpty, IsString } from "class-validator";

export class ReadMessageDto {

    @IsNotEmpty()
    @IsString()
    fromUserId?: string;

    toUserId?: string;
}