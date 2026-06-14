import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ default: 'Operation' })
  icon: string;

  @Column()
  route: string;

  @Column({ default: 'main' })
  group: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ default: true })
  visible: boolean;
}
