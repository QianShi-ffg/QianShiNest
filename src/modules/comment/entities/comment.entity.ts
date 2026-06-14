import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ default: 'diary' })
  targetType: string;

  @Column({ type: 'int' })
  targetId: number;

  @Column({ type: 'int', nullable: true })
  parentId: number;

  @Column({ nullable: true })
  replyTo: string;

  @Column({ length: 20, default: '访客' })
  author: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ default: 'visible' })
  status: string;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
