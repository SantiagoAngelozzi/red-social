import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestConUsuario } from './request-con-usuario.js';

export const UsuarioActual = createParamDecorator((_dato: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestConUsuario>();
  return request.usuario;
});