import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('miniapp_user')
export class MiniappUser {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ unique: true })
  openid: string;

  @Column({ nullable: true })
  unionid: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true, nullable: true })
  userCode: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginTime: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
