import { BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character, CharacterStatus } from './entities/character.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { CreateCharacterDto } from './dto/create-character.dto.js';
import { UpdateCharacterDto } from './dto/update-character.dto.js';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createCharacterDto: CreateCharacterDto) {
    const { team_id, ...data } = createCharacterDto;

    // El alias es único -> 409 si ya existe
    await this.checkAliasAvailable(data.alias);

    const character = this.characterRepository.create(data);
    if (team_id !== undefined) {
      character.team = await this.findActiveTeam(team_id);
    }

    const saved = await this.characterRepository.save(character);
    return this.findOne(saved.id);
  }

  // GET /characters  o  GET /characters?status=ACTIVE
  async findAll(status?: CharacterStatus) {
    return await this.characterRepository.find({
      where: status ? { status } : {},
      relations: { team: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const character = await this.characterRepository.findOne({
      where: { id },
      relations: { team: true },
    });
    if (!character) throw new NotFoundException(`El personaje con id ${id} no existe`);
    return character;
  }

  async update(id: number, updateCharacterDto: UpdateCharacterDto) {
    const character = await this.findOne(id);
    const { team_id, ...data } = updateCharacterDto;

    if (data.alias && data.alias !== character.alias) {
      await this.checkAliasAvailable(data.alias);
    }

    this.characterRepository.merge(character, data);
    if (team_id !== undefined) {
      character.team = await this.findActiveTeam(team_id);
    }

    await this.characterRepository.save(character);
    return this.findOne(id);
  }

  async remove(id: number) {
    const character = await this.findOne(id);
    await this.characterRepository.remove(character);
    return { message: 'Personaje eliminado con éxito' };
  }

  // ---------- funciones de apoyo ----------

  private async checkAliasAvailable(alias: string) {
    const existing = await this.characterRepository.findOne({ where: { alias } });
    if (existing) throw new ConflictException(`Ya existe un personaje con el alias "${alias}"`);
  }

  // Mismo criterio que en teams: el equipo debe existir (404) y estar activo (400)
  private async findActiveTeam(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`El equipo con id ${teamId} no existe`);
    if (!team.active) throw new BadRequestException('El equipo no está activo');
    return team;
  }
}
