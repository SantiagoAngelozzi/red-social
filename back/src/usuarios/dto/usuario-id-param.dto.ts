import { IsMongoId } from 'class-validator';

export class UsuarioIdParamDto {
  @IsMongoId({ message: 'El usuario no es válido' })
  id: string;
}