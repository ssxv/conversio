import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from '../app/entity/base.entity';

@Entity()
@Unique('UQ_user_email', ['email'])
export class User extends BaseEntity {

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'text' })
    email: string;

    @Column({ type: 'text' })
    hash: string;

    @Column({ type: 'text' })
    salt: string;

    @Column({ type: 'tsvector', nullable: true })
    tsv: string;

    token?: string;
}
