import { Controller, Get, Post, Body, Put, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id') // Obtiene un equipo por id
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Get(':id/characters') // Lista personajes del equipo
  getCharacters(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.getCharactersByTeam(id);
  }

  @Put(':id') // Reemplaza equipo
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Patch(':id/characters') // Asigna personajes
  assignCharacters(
    @Param('id', ParseIntPipe) id: number, 
    @Body('characterIds') characterIds: number[]
  ) {
    return this.teamsService.assignCharacters(id, characterIds);
  }

  @Delete(':id') // Elimina equipo
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }
}