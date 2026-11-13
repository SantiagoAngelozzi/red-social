import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import type { PayloadToken } from '../payload-token.js';
import type { RequestConUsuario } from '../request-con-usuario.js';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token');
    }

    let payload: PayloadToken;
    try {
      payload = await this.jwtService.verifyAsync<PayloadToken>(authorization.slice('Bearer '.length));
    } catch {
      throw new UnauthorizedException('El token es inválido o se venció');
    }

    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('El usuario no existe o está deshabilitado');
    }

    request.usuario = usuario;
    return true;
  }
}