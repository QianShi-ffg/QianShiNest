import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MiniappUser } from './miniapp-user.entity';

@Entity('miniapp_tool_usage')
export class MiniappToolUsage {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index()
  @Column({ type: 'int' })
  userId: number;

  @Index()
  @Column()
  toolKey: string;

  @Column()
  toolTitle: string;

  @Column({ default: 'open' })
  entryType: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @ManyToOne(() => MiniappUser, { onDelete: 'CASCADE' })
  user: MiniappUser;
}
