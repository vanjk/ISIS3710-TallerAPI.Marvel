import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  base?: string;

  @IsInt()
  @IsOptional()
  founded_year?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  // Según el requerimiento, opcionalmente puede recibir una lista de IDs de personajes al crear[cite: 2]
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  characterIds?: number[]; 
}