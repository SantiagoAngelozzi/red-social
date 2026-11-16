import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { PayloadToken } from './payload-token.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(datos, imagen);
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
    return this.usuariosService.sinPassword(usuario);
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
    return { token, usuario: this.usuariosService.sinPassword(usuario) };
  }
}