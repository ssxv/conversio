import { BaseEntity as TypeOrmBaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity extends TypeOrmBaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;
}
