import { Controller, Get, Param, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@/app/guard/auth.guard';
import { CurrentUser } from '@/app/decorator/current-user.decorator';
import { User } from './user.entity';
import { GetUsersDto } from './dto/GetUsersDto';

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Get()
    getUsers(@Query(new ValidationPipe({ transform: true })) dto: GetUsersDto, @CurrentUser() currentUser: User) {
        const { searchText } = dto;
        if (searchText) {
            return this.usersService.getUsersBySearchQuery(searchText, currentUser);
        }
        return this.usersService.getUsers(currentUser);
    }

    @Get('/recent')
    getRecentUsers(@CurrentUser() currentUser: User) {
        return this.usersService.getRecentUsers(currentUser);
    }

    @Get('/:id/status')
    getUserStatus(@Param('id') userId: string) {
        return this.usersService.getUserStatus(userId);
    }
}
