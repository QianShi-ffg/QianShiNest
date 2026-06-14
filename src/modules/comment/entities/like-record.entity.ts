import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['targetType', 'targetId', 'ip'], { unique: true })
export class LikeRecord {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  targetType: string;

  @Column({ type: 'int' })
  targetId: number;

  @Column()
  ip: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;
}
