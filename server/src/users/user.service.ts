import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { ChatService } from '@/chat/chat.service';
import { Message } from '@/messages/message.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
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
        return this.userRepo.find({ where: { id: Not(currentUser.id) } });
    }

    getUsersBySearchQuery(searchText: string, currentUser: User) {
        return this.userRepo.query(`
        SELECT t1.id as id, t1.name as name, t1.email as email, t1."createdAt" as "createdAt", t1."modifiedAt" as "modifiedAt" FROM (
            SELECT * FROM "user" u, plainto_tsquery($1) AS q WHERE (tsv @@ q)
        ) AS t1 WHERE t1.id <> $2 ORDER BY ts_rank_cd(t1.tsv, q) DESC;
        `, [searchText, currentUser.id.toString()]);
    }

    async getRecentUsers(currentUser: User): Promise<User[]> {
        const query = `
        select * from ( 
            select distinct on ("t1"."userId") * from (
                (select *, u.id as "userId", m.id as "messageId", u."createdAt" as "userCreatedAt", m."createdAt" as "messageCreatedAt", u."modifiedAt" as "userModifiedAt", m."modifiedAt" as "messageModifiedAt" from "user" u left join message m on u.id = m."to" where m."from" = $1) union 
                (select *, u.id as "userId", m.id as "messageId", u."createdAt" as "userCreatedAt", m."createdAt" as "messageCreatedAt", u."modifiedAt" as "userModifiedAt", m."modifiedAt" as "messageModifiedAt" from "user" u left join message m on u.id = m."from" where m."to" = $1)
            ) as "t1" order by "t1"."userId", "t1"."messageCreatedAt" desc 
        ) as "t2" order by "t2"."messageCreatedAt" desc;        
        `;
        const data = await this.userRepo.query(query, [currentUser.id.toString()]);
        return this.prepareUsers(data);
    }

    prepareUsers(data: any[]): User[] {
        return data.map(d => {
            const message = new Message();
            message.id = d.messageId;
            message.from = d.from;
            message.to = d.to;
            message.message = d.message;
            message.read = d.read;
            message.clientId = d.clientId;
            message.createdAt = d.messageCreatedAt;
            message.modifiedAt = d.messageModifiedAt;

            const user = new User();
            user.id = d.userId;
            user.name = d.name;
            user.email = d.email;
            user.createdAt = d.userCreatedAt;
            user.modifiedAt = d.userModifiedAt;
            user['lastMessage'] = message;
            return user;
        });
    }

    getUserStatus(userId: string) {
        const status = this.chatService.getActiveUser(userId) ? 'online' : 'offline';
        return { status };
    }
}
