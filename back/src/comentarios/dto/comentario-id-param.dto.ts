import { IsMongoId } from 'class-validator';

export class ComentarioIdParamDto {
  @IsMongoId({ message: 'El comentario no es válido' })
  id: string;
}