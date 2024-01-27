import { IsNotEmpty, IsString } from "class-validator";

export class GetMessageDto {

    @IsNotEmpty()
    @IsString()
    withUserId: string;

    forUserId?: string;
}
