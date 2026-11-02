import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) {}

  buscarPorCorreo(correo: string) {
    return this.usuarioModel.findOne({ correo: correo.toLowerCase() });
  }

  buscarPorNombreUsuario(nombreUsuario: string) {
    return this.usuarioModel.findOne({ nombreUsuario });
  }

  crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }
}
