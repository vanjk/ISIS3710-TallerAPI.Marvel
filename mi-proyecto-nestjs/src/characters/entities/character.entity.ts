import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';

// Estados que permite la tabla CHECK
export enum CharacterStatus {
  ACTIVE = 'ACTIVE',
  INJURED = 'INJURED',
  MISSING = 'MISSING',
  RETIRED = 'RETIRED',
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  real_name: string;

  @Column({ length: 100, unique: true })
  alias: string;

  @Column({ length: 150 })
  main_power: string;

  @Column({ type: 'int' })
  power_level: number;

  @Column({ type: 'varchar', length: 20, default: CharacterStatus.ACTIVE })
  status: CharacterStatus;

  @Column({ default: false })
  is_villain: boolean;

  // Relación: muchos personajes pertenecen a un equipo o a ninguno.
  @ManyToOne(() => Team, (team: Team) => team.characters, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}