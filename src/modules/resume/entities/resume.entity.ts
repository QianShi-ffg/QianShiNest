import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'longtext', nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'longtext', nullable: true })
  avatar: string;

  @Column({ type: 'longtext', nullable: true })
  resumeFile: string;

  @Column({ type: 'longtext', nullable: true })
  resumePassword: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'longtext', nullable: true })
  summary: string;

  @Column({ type: 'longtext', nullable: true })
  skills: string;

  @Column({ type: 'longtext', nullable: true })
  experiences: string;

  @Column({ type: 'longtext', nullable: true })
  educations: string;

  @Column({ type: 'longtext', nullable: true })
  projects: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updataTime: Date;
}
