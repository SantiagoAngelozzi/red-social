import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordHasher } from '@nestjs/authentication';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { ArchivoSubido } from './archivo-subido.js';

const EDAD_MINIMA = 13;
const CARPETA_PERFILES = join(process.cwd(), 'uploads', 'perfiles');

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly config: ConfigService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async registrar(datos: RegistroDto, imagen?: ArchivoSubido) {
    const nacimiento = new Date(datos.fechaNacimiento);
    if (nacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura');
    }
    if (this.calcularEdad(nacimiento) < EDAD_MINIMA) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años para registrarte`);
    }

    if (await this.usuariosService.buscarPorCorreo(datos.correo)) {
      throw new ConflictException('Ese correo ya está registrado');
    }
    if (await this.usuariosService.buscarPorNombreUsuario(datos.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    const passwordHasheada = await this.passwordHasher.hash(datos.password);

    const imagenPerfil = imagen ? await this.guardarImagen(imagen) : null;

    const usuario = await this.usuariosService.crear({
      ...datos,
      fechaNacimiento: nacimiento,
      password: passwordHasheada,
      imagenPerfil,
    });

    return this.sinPassword(usuario);
  }

  async login({ identificador, password }: LoginDto) {
    const usuario = identificador.includes('@')
      ? await this.usuariosService.buscarPorCorreo(identificador)
      : await this.usuariosService.buscarPorNombreUsuario(identificador);

    const passwordCorrecta = await this.passwordHasher.verify(password, usuario?.password);

    if (!usuario || !passwordCorrecta) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu usuario está deshabilitado. Contactá a un administrador.');
    }

    return this.sinPassword(usuario);
  }

  private sinPassword(usuario: UsuarioDocument) {
    const { password: _password, ...datos } = usuario.toObject();
    return datos;
  }

  private async guardarImagen(imagen: ArchivoSubido): Promise<string> {
    await mkdir(CARPETA_PERFILES, { recursive: true });
    const nombreArchivo = `${randomUUID()}${extname(imagen.originalname).toLowerCase()}`;
    await writeFile(join(CARPETA_PERFILES, nombreArchivo), imagen.buffer);

    const baseUrl = this.config.get<string>('BASE_URL') ?? 'http://localhost:3000';
    return `${baseUrl}/uploads/perfiles/${nombreArchivo}`;
  }

  private calcularEdad(nacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();
    const yaCumplio =
      hoy.getMonth() > nacimiento.getUTCMonth() ||
      (hoy.getMonth() === nacimiento.getUTCMonth() && hoy.getDate() >= nacimiento.getUTCDate());
    if (!yaCumplio) edad--;
    return edad;
  }
}
