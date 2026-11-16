import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from '../publicaciones/schemas/publicacion.schema.js';
import { Comentario } from '../comentarios/schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

const ZONA_HORARIA = '-03:00';
const DIAS_POR_DEFECTO = 30;
const DIAS_MAXIMOS = 366;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

interface Rango {
  desde: string;
  hasta: string;
  inicio: Date;
  fin: Date;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  async publicacionesPorUsuario(filtros: RangoFechasDto) {
    const rango = this.armarRango(filtros);

    const datos = await this.publicacionModel.aggregate<{
      usuarioId: Types.ObjectId;
      nombreUsuario: string;
      cantidad: number;
    }>([
      { $match: { activo: true, createdAt: { $gte: rango.inicio, $lt: rango.fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      { $project: { _id: 0, usuarioId: '$_id', nombreUsuario: '$usuario.nombreUsuario', cantidad: 1 } },
      { $sort: { cantidad: -1, nombreUsuario: 1 } },
    ]);

    return this.respuesta(rango, datos);
  }

  async comentariosPorDia(filtros: RangoFechasDto) {
    const rango = this.armarRango(filtros);

    const porDia = await this.comentarioModel.aggregate<{ _id: string; cantidad: number }>([
      { $match: { createdAt: { $gte: rango.inicio, $lt: rango.fin } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA_HORARIA } },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const cantidades = new Map(porDia.map((dia) => [dia._id, dia.cantidad]));
    const datos = this.diasDelRango(rango).map((fecha) => ({ fecha, cantidad: cantidades.get(fecha) ?? 0 }));

    return this.respuesta(rango, datos);
  }

  async comentariosPorPublicacion(filtros: RangoFechasDto) {
    const rango = this.armarRango(filtros);

    const datos = await this.comentarioModel.aggregate<{
      publicacionId: Types.ObjectId;
      titulo: string;
      cantidad: number;
    }>([
      { $match: { createdAt: { $gte: rango.inicio, $lt: rango.fin } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activo': true } },
      { $project: { _id: 0, publicacionId: '$_id', titulo: '$publicacion.titulo', cantidad: 1 } },
      { $sort: { cantidad: -1, titulo: 1 } },
    ]);

    return this.respuesta(rango, datos);
  }

  private respuesta<T extends { cantidad: number }>(rango: Rango, datos: T[]) {
    const total = datos.reduce((suma, dato) => suma + dato.cantidad, 0);
    return { desde: rango.desde, hasta: rango.hasta, total, datos };
  }

  private armarRango({ desde, hasta }: RangoFechasDto): Rango {
    const fechaHasta = hasta ?? this.hoy();
    const fechaDesde = desde ?? this.sumarDias(fechaHasta, -(DIAS_POR_DEFECTO - 1));

    if (fechaDesde > fechaHasta) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }

    const inicio = new Date(`${fechaDesde}T00:00:00${ZONA_HORARIA}`);
    const fin = new Date(`${this.sumarDias(fechaHasta, 1)}T00:00:00${ZONA_HORARIA}`);

    if ((fin.getTime() - inicio.getTime()) / MS_POR_DIA > DIAS_MAXIMOS) {
      throw new BadRequestException(`El lapso puede ser de hasta ${DIAS_MAXIMOS} días`);
    }

    return { desde: fechaDesde, hasta: fechaHasta, inicio, fin };
  }

  private diasDelRango({ desde, hasta }: Rango): string[] {
    const dias: string[] = [];
    for (let fecha = desde; fecha <= hasta; fecha = this.sumarDias(fecha, 1)) {
      dias.push(fecha);
    }
    return dias;
  }

  private sumarDias(fecha: string, dias: number): string {
    const dia = new Date(`${fecha}T00:00:00Z`);
    dia.setUTCDate(dia.getUTCDate() + dias);
    return dia.toISOString().slice(0, 10);
  }

  private hoy(): string {
    return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
}