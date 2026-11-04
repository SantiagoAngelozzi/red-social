import { IsMongoId } from 'class-validator';

export class MeGustaDto {
  @IsMongoId({ message: 'El usuario no es válido' })
  usuarioId: string;
}