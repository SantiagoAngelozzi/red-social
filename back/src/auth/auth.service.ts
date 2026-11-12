import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { FileService } from '../file/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { PayloadToken } from './payload-token.js';

const EDAD_MINIMA = 13;
const CARPETA_PERFILES = 'rocket-social/perfiles';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen?: Express.Multer.File) {
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

    const imagenPerfil = imagen
      ? await this.fileService.cloudinaryUploader(imagen, CARPETA_PERFILES)
      : null;

    const usuario = await this.usuariosService.crear({
      ...datos,
      fechaNacimiento: nacimiento,
      password: passwordHasheada,
      imagenPerfil,
    });

    return this.respuestaConToken(usuario);
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

    return this.respuestaConToken(usuario);
  }

  async autorizar(authorization?: string) {
    const payload = await this.verificarToken(authorization);
    const usuario = await this.usuarioActivo(payload.sub);
    return this.sinPassword(usuario);
  }

  async refrescar(authorization?: string) {
    const payload = await this.verificarToken(authorization);
    await this.usuarioActivo(payload.sub);

    const token = await this.jwtService.signAsync({
      sub: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    });
    return { token };
  }

  async verificarToken(authorization?: string): Promise<PayloadToken> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token');
    }
    const token = authorization.slice('Bearer '.length);

    try {
      return await this.jwtService.verifyAsync<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('El token es inválido o se venció');
    }
  }

  private async usuarioActivo(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('El usuario no existe o está deshabilitado');
    }
    return usuario;
  }

  private async respuestaConToken(usuario: UsuarioDocument) {
    const payload: PayloadToken = {
      sub: usuario._id.toString(),
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, usuario: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: UsuarioDocument) {
    const { password: _password, ...datos } = usuario.toObject();
    return datos;
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