import { IsMongoId } from 'class-validator';

export class IdParamDto {
  @IsMongoId({ message: 'La publicación no es válida' })
  id: string;
}