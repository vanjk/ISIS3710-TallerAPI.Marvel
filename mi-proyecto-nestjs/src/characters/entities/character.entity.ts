import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.characters, { nullable: true })
  team: Team | null;
}
