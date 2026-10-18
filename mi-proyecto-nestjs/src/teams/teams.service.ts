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
    // REGLA 2: No pueden existir dos equipos con el mismo name (409 Conflict)
    const existingTeam = await this.teamRepository.findOne({ where: { name: createTeamDto.name } });
    if (existingTeam) throw new ConflictException('Ya existe un equipo con ese nombre');

    const newTeam = this.teamRepository.create(createTeamDto);
    const savedTeam = await this.teamRepository.save(newTeam);

    // Si al crear nos enviaron IDs de personajes, los asignamos
    if (createTeamDto.characterIds && createTeamDto.characterIds.length > 0) {
      await this.assignCharacters(savedTeam.id, createTeamDto.characterIds);
    }

    return this.findOne(savedTeam.id);
  }

  async findAll() {
    return await this.teamRepository.find();
  }

  async findOne(id: number) {
    const team = await this.teamRepository.findOne({ where: { id } });
    // REGLA 1: Si se consulta un equipo que no existe, responder 404
    if (!team) throw new NotFoundException(`El equipo con id ${id} no existe`);
    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    await this.findOne(id); // Reutilizamos findOne para validar que exista (REGLA 1 - 404)

    if (updateTeamDto.name) {
      const existingTeam = await this.teamRepository.findOne({ where: { name: updateTeamDto.name } });
      if (existingTeam && existingTeam.id !== id) {
        throw new ConflictException('El nombre del equipo ya existe'); // REGLA 2
      }
    }

    await this.teamRepository.update(id, updateTeamDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const team = await this.teamRepository.findOne({ where: { id }, relations: { characters: true } });
    if (!team) throw new NotFoundException(`El equipo con id ${id} no existe`); // REGLA 1

    // REGLA 6: No se puede eliminar un equipo que tenga personajes asociados (409 Conflict)
    if (team.characters && team.characters.length > 0) {
      throw new ConflictException('No se puede eliminar un equipo que tenga personajes asociados. Desactívelo mediante PUT (active: false).');
    }

    await this.teamRepository.delete(id);
    return { message: 'Equipo eliminado con éxito' };
  }

  async assignCharacters(teamId: number, characterIds: number[]) {
    const team = await this.findOne(teamId); // REGLA 1

    // REGLA 5: El equipo debe estar activo (400 Bad Request)
    if (!team.active) throw new BadRequestException('El equipo no está activo');

    // REGLA 5: Todos los personajes enviados deben existir (404 Not Found)
    const characters = await this.characterRepository.findBy({ id: In(characterIds) });
    if (characters.length !== characterIds.length) {
      throw new NotFoundException('Uno o varios personajes enviados no existen en la base de datos');
    }

    // Guardamos la nueva relación
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
}