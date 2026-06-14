import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Changelog {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  version: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  tag: string;

  @Column()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  changes: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
