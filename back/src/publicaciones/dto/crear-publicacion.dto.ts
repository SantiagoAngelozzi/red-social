import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(80, { message: 'El título puede tener hasta 80 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(500, { message: 'El mensaje puede tener hasta 500 caracteres' })
  mensaje: string;
}