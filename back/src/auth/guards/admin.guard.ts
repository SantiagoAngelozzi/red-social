import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { RequestConUsuario } from '../request-con-usuario.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { usuario } = context.switchToHttp().getRequest<RequestConUsuario>();
    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }
    return true;
  }
}