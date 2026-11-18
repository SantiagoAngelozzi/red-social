import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export class EditarPerfilDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  @MaxLength(50, { message: 'El nombre puede tener hasta 50 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El nombre solo puede tener letras' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El apellido no puede quedar vacío' })
  @MaxLength(50, { message: 'El apellido puede tener hasta 50 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El apellido solo puede tener letras' })
  apellido?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres' })
  descripcion?: string;
}
