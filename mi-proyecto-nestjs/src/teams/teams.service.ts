import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { Character } from '../characters/entities/character.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    //No pueden existir dos equipos con el mismo name (409 Conflict)
    const existingTeam = await this.teamRepository.findOne({ where: { name: createTeamDto.name } });
    if (existingTeam) throw new ConflictException('Ya existe un equipo con ese nombre');

    const { characterIds, ...teamData } = createTeamDto;

    // REGLA 5: validar ANTES de guardar, para no dejar el equipo creado si algo falla
    if (characterIds && characterIds.length > 0) {
      await this.validateAssignment(teamData.active ?? true, characterIds);
    }

    const newTeam = this.teamRepository.create(teamData);
    const savedTeam = await this.teamRepository.save(newTeam);

    // Si al crear nos enviaron IDs de personajes, los asignamos
    if (characterIds && characterIds.length > 0) {
      await this.assignCharacters(savedTeam.id, characterIds);
    }

    return this.findOne(savedTeam.id);
  }

  async findAll() {
    return await this.teamRepository.find();
  }

  async findOne(id: number) {
    const team = await this.teamRepository.findOne({ where: { id } });
    // Si se consulta un equipo que no existe, responder 404
    if (!team) throw new NotFoundException(`El equipo con id ${id} no existe`);
    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOne(id); // Reutilizamos findOne para validar que exista (REGLA 1 - 404)

    if (updateTeamDto.name) {
      const existingTeam = await this.teamRepository.findOne({ where: { name: updateTeamDto.name } });
      if (existingTeam && existingTeam.id !== id) {
        throw new ConflictException('El nombre del equipo ya existe'); // REGLA 2
      }
    }

    const { characterIds, ...teamData } = updateTeamDto;

    // REGLA 5: validar ANTES de actualizar, para no dejar cambios a medias si algo falla
    if (characterIds && characterIds.length > 0) {
      await this.validateAssignment(teamData.active ?? team.active, characterIds);
    }

    await this.teamRepository.update(id, teamData);
    if (characterIds && characterIds.length > 0) {
      await this.assignCharacters(id, characterIds);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const team = await this.teamRepository.findOne({ where: { id }, relations: { characters: true } });
    if (!team) throw new NotFoundException(`El equipo con id ${id} no existe`); // REGLA 1

    //No se puede eliminar un equipo que tenga personajes asociados
    if (team.characters && team.characters.length > 0) {
      throw new ConflictException('No se puede eliminar un equipo que tenga personajes asociados. Desactívelo mediante PUT (active: false).');
    }

    await this.teamRepository.delete(id);
    return { message: 'Equipo eliminado con éxito' };
  }

  async assignCharacters(teamId: number, characterIds: number[]) {
    const team = await this.findOne(teamId); // REGLA 1

    // REGLA 5: el equipo debe estar activo (400) y los personajes deben existir (404)
    const characters = await this.validateAssignment(team.active, characterIds);

    // Guardamos la nueva relación (si ya tenía otro equipo, se reasigna a este)
    for (const char of characters) {
      char.team = team;
      await this.characterRepository.save(char);
    }
    return { message: 'Personajes asignados correctamente al equipo' };
  }

  async getCharactersByTeam(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId }, relations: { characters: true } });
    if (!team) throw new NotFoundException('El equipo no existe');
    return team.characters;
  }

  // REGLA 5: valida que el equipo esté activo (400) y que todos los personajes existan (404)
  private async validateAssignment(teamActive: boolean, characterIds: number[]) {
    if (!teamActive) throw new BadRequestException('El equipo no está activo');

    const characters = await this.characterRepository.findBy({ id: In(characterIds) });
    if (characters.length !== new Set(characterIds).size) {
      throw new NotFoundException('Uno o varios personajes enviados no existen en la base de datos');
    }
    return characters;
  }
}