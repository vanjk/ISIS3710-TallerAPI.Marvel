import { PartialType } from '@nestjs/mapped-types';
import { CreateCharacterDto } from './create-character.dto.js';

export class UpdateCharacterDto extends PartialType(CreateCharacterDto) {}
