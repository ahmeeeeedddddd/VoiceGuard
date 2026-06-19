import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('checklist_rules')
export class ChecklistRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string; // e.g., AC-01

  @Column()
  text: string;

  @Column({ nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  keywords?: string[];

  @Column({ type: 'int', default: 10 })
  points: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, default: 'COMPLIANCE' })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
