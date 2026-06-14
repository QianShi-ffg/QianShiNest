import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Diary {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ default: 'text' })
  type: string;

  @Column({ type: 'longtext', nullable: true })
  media: string;

  @Column({ type: 'longtext', nullable: true })
  poster: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'longtext', nullable: true })
  longContent: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  weather: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
