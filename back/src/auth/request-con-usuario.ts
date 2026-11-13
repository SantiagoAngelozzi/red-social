import type { Request } from 'express';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';

export interface RequestConUsuario extends Request {
  usuario: UsuarioDocument;
}