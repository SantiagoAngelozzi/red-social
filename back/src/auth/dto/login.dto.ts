import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Escribí tu correo o nombre de usuario' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribí tu contraseña' })
  password: string;
}
