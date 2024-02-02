import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { ChatService } from '@/chat/chat.service';
import { DATASOURCE_NAME } from '@/app/app.constant';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User, DATASOURCE_NAME)
        private userRepo: Repository<User>,

        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
    ) { }

    createUser(user: User) {
        return this.userRepo.save(user);
    }

    getUser(id: string) {
        return this.userRepo.findOne({ where: { id } });
    }

    getUserByEmail(email: string) {
        return this.userRepo.findOneBy({ email });
    }

    getUsers(currentUser: User) {
        return this.userRepo.find({
            select: {
                id: true,
                email: true,
                name: true,
            },
            where: { id: Not(currentUser.id) }
        });
    }

    getUsersBySearchQuery(searchText: string, currentUser: User) {
        const query = `
        SELECT t1.id as id, t1.name as name, t1.email as email FROM (
            SELECT * FROM "user" u, plainto_tsquery($1) AS q WHERE (tsv @@ q)
        ) AS t1 WHERE t1.id <> $2 ORDER BY ts_rank_cd(t1.tsv, q) DESC;
        `;
        return this.userRepo.query(query, [searchText, currentUser.id.toString()]);
    }

    async getRecentUsers(currentUser: User): Promise<User[]> {
        const query = `
        select id, email, name from ( 
            select distinct on ("t1"."id") * from (
                (select u.id, u.email, u.name, m."createdAt" as "messageCreatedAt" from "user" u left join message m on u.id = m."to" where m."from" = $1) union 
                (select u.id, u.email, u.name, m."createdAt" as "messageCreatedAt" from "user" u left join message m on u.id = m."from" where m."to" = $1)
            ) as "t1" order by "t1"."id", "t1"."messageCreatedAt" desc 
        ) as "t2" order by "t2"."messageCreatedAt" desc;                
        `;
        return this.userRepo.query(query, [currentUser.id.toString()]);
    }

    getUserStatus(userId: string) {
        const status = this.chatService.getActiveUser(userId) ? 'online' : 'offline';
        return { status };
    }
}
