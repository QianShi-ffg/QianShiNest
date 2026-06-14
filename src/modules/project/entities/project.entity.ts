import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'personal' })
  projectType: string;

  @Column({ type: 'longtext', nullable: true })
  desc: string;

  @Column({ type: 'longtext', nullable: true })
  longDesc: string;

  @Column({ type: 'longtext', nullable: true })
  image: string;

  @Column({ type: 'longtext', nullable: true })
  images: string;

  @Column({ type: 'longtext', nullable: true })
  videoUrl: string;

  @Column({ type: 'longtext', nullable: true })
  tags: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  date: string;

  @Column({ type: 'longtext', nullable: true })
  github: string;

  @Column({ type: 'longtext', nullable: true })
  demo: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
