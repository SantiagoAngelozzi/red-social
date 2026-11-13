import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { SortOrder } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { FileService } from '../file/file.service.js';

const CARPETA_PUBLICACIONES = 'rocket-social/publicaciones';
const DATOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly fileService: FileService,
  ) {}

  async crear(datos: CrearPublicacionDto, autor: UsuarioDocument, imagen?: Express.Multer.File) {
    const urlImagen = imagen
      ? await this.fileService.cloudinaryUploader(imagen, CARPETA_PUBLICACIONES)
      : null;

    const publicacion = await this.publicacionModel.create({
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagen: urlImagen,
      autor: autor._id,
    });

    return publicacion.populate('autor', DATOS_AUTOR);
  }

  async listar({ orden = 'fecha', autor, offset = 0, limit = 10 }: ListarPublicacionesDto) {
    const filtro: { activo: boolean; autor?: Types.ObjectId } = { activo: true };
    if (autor) {
      filtro.autor = new Types.ObjectId(autor);
    }

    const ordenamiento: Record<string, SortOrder> =
      orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(ordenamiento)
        .skip(offset)
        .limit(limit)
        .populate('autor', DATOS_AUTOR),
      this.publicacionModel.countDocuments(filtro),
    ]);

    return { publicaciones, total, offset, limit };
  }

  async buscarActiva(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('autor', DATOS_AUTOR);
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    return publicacion;
  }

  async darMeGusta(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activo: true, meGusta: { $ne: usuario._id } },
        { $push: { meGusta: usuario._id }, $inc: { cantidadMeGusta: 1 } },
        { returnDocument: 'after' },
      )
      .populate('autor', DATOS_AUTOR);

    if (!publicacion) {
      await this.validarPublicacion(id);
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }
    return publicacion;
  }

  async quitarMeGusta(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activo: true, meGusta: usuario._id },
        { $pull: { meGusta: usuario._id }, $inc: { cantidadMeGusta: -1 } },
        { returnDocument: 'after' },
      )
      .populate('autor', DATOS_AUTOR);

    if (!publicacion) {
      await this.validarPublicacion(id);
      throw new ConflictException('No le habías dado me gusta a esta publicación');
    }
    return publicacion;
  }

  async eliminar(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activo: true });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }

    const esAutor = publicacion.autor.equals(usuario._id);
    const esAdministrador = usuario.perfil === 'administrador';
    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publicacion.activo = false;
    await publicacion.save();

    return { mensaje: 'Publicación eliminada' };
  }

  private async validarPublicacion(id: string) {
    const existe = await this.publicacionModel.exists({ _id: id, activo: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}