import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Character } from '../../characters/entities/character.entity.js';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 150, nullable: true })
  base: string;

  @Column({ type: 'int', nullable: true })
  founded_year: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación: Un equipo puede tener muchos personajes (0..*)
  @OneToMany(() => Character, (character) => character.team)
  characters: Character[];
}