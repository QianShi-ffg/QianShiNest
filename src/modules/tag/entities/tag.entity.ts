import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TagList {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  describe: string;

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
}
