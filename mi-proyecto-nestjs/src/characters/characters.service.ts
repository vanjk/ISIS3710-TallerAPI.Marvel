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

    // R2: el alias es único -> 409
    await this.checkAliasAvailable(data.alias);

    const character = this.characterRepository.create(data);
    if (team_id !== undefined) {
      // R4: el equipo debe existir y estar activo
      character.team = await this.findActiveTeam(team_id);
    }

    const saved = await this.characterRepository.save(character);
    return this.findOne(saved.id);
  }

  async findAll(status?: CharacterStatus, teamId?: number) {
    return await this.characterRepository.find({
      where: {
        ...(status ? { status } : {}),
        ...(teamId !== undefined ? { team: { id: teamId } } : {}),
      },
      relations: { team: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const character = await this.characterRepository.findOne({
      where: { id },
      relations: { team: true },
    });
    // R1: si no existe, entonces 404
    if (!character) throw new NotFoundException(`El personaje con id ${id} no existe`);
    return character;
  }

  // PUT: reemplaza el personaje completo
  async update(id: number, updateCharacterDto: UpdateCharacterDto) {
    const character = await this.findOne(id);
    const { team_id, ...data } = updateCharacterDto;

    if (data.alias !== character.alias) {
      await this.checkAliasAvailable(data.alias);
    }

    // Lo que no venga en el body vuelve a su valor por defecto
    const newStatus = data.status ?? CharacterStatus.ACTIVE;
    this.checkStatusTransition(character.status, newStatus);

    character.real_name = data.real_name;
    character.alias = data.alias;
    character.main_power = data.main_power;
    character.power_level = data.power_level;
    character.status = newStatus;
    character.is_villain = data.is_villain ?? false;
    character.team = team_id !== undefined ? await this.findActiveTeam(team_id) : null;

    await this.characterRepository.save(character);
    return this.findOne(id);
  }

  // cambia solo el estado
  async updateStatus(id: number, status: CharacterStatus) {
    const character = await this.findOne(id); 
    this.checkStatusTransition(character.status, status);

    character.status = status;
    await this.characterRepository.save(character);
    return this.findOne(id);
  }

  // R1
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

  private async findActiveTeam(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`El equipo con id ${teamId} no existe`);
    if (!team.active) throw new BadRequestException('El equipo no está activo');
    return team;
  }

  // R7: RETIRED no puede pasar directo a INJURED
  private checkStatusTransition(current: CharacterStatus, next: CharacterStatus) {
    if (current === CharacterStatus.RETIRED && next === CharacterStatus.INJURED) {
      throw new BadRequestException(
        'Un personaje RETIRED no puede pasar directamente a INJURED; primero debe volver a ACTIVE',
      );
    }
  }
}
