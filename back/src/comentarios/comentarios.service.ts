import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './schemas/comentario.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PublicacionesService } from '../publicaciones/publicaciones.service.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';

const DATOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  async crear(publicacionId: string, autor: UsuarioDocument, { mensaje }: CrearComentarioDto) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const comentario = await this.comentarioModel.create({
      mensaje,
      autor: autor._id,
      publicacion: new Types.ObjectId(publicacionId),
    });

    return comentario.populate('autor', DATOS_AUTOR);
  }

  async listar(publicacionId: string, { offset = 0, limit = 5 }: ListarComentariosDto) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autor', DATOS_AUTOR),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { comentarios, total, offset, limit };
  }

  async editar(id: string, usuario: UsuarioDocument, { mensaje }: EditarComentarioDto) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    await this.publicacionesService.buscarActiva(comentario.publicacion.toString());

    if (!comentario.autor.equals(usuario._id)) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', DATOS_AUTOR);
  }
}