import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../app/entity/base.entity';

@Entity()
export class Message extends BaseEntity {

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'uuid' })
    from: string;

    @Column({ type: 'uuid' })
    to: string;

    @Column({ type: 'boolean', default: false })
    read: boolean;

    @Column({ type: 'uuid' })
    clientId: string;
}
