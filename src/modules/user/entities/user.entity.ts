import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'longtext' })
  password: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ default: 'admin' })
  role: string;

  @Column({ type: 'longtext', nullable: true })
  permissions: string;
}
