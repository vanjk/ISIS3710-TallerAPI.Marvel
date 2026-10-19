import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AssignCharactersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  characterIds: number[];
}
