import {IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min} from 'class-validator';
import { CharacterStatus } from '../entities/character.entity.js';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  real_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  alias: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  main_power: string;

  @IsInt()
  @Min(1)
  @Max(100)
  power_level: number;

  @IsEnum(CharacterStatus)
  @IsOptional()
  status?: CharacterStatus;

  @IsBoolean()
  @IsOptional()
  is_villain?: boolean;

  // Id del equipo al que pertenece (puede no pertenerecer a ninguno).
  @IsInt()
  @IsOptional()
  team_id?: number;
}