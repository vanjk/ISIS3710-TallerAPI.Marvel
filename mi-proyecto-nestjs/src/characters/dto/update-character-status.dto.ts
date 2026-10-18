import { IsEnum } from 'class-validator';
import { CharacterStatus } from '../entities/character.entity.js';

export class UpdateCharacterStatusDto {
  @IsEnum(CharacterStatus)
  status: CharacterStatus;
}
