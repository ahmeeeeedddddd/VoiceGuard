import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('checklist_rules')
export class ChecklistRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Unnamed Rule' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  requiredPhrase: string;

  @Column({ default: false })
  isCriticalFail: boolean;

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
