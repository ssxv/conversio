import { Transform } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetMessageDto {

    @IsNotEmpty()
    @IsString()
    conversationWithUserId: string;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    fromDate?: Date;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    toDate?: Date;

    @IsOptional()
    @Transform(({ value }) => isNaN(value) ? null : +(value))
    @IsInt()
    take?: number = 50;

    currentUserId?: string;
}
