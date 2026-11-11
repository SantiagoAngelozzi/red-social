import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './schemas/comentario.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { PublicacionesService } from '../publicaciones/publicaciones.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';

const DATOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    private readonly publicacionesService: PublicacionesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(publicacionId: string, { usuarioId, mensaje }: CrearComentarioDto) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new NotFoundException('El usuario no existe o está deshabilitado');
    }

    const comentario = await this.comentarioModel.create({
      mensaje,
      autor: usuario._id,
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

  async editar(id: string, { usuarioId, mensaje }: EditarComentarioDto) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    await this.publicacionesService.buscarActiva(comentario.publicacion.toString());

    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new NotFoundException('El usuario no existe o está deshabilitado');
    }

    if (!comentario.autor.equals(usuario._id)) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', DATOS_AUTOR);
  }
}