import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: String, default: null })
  imagen: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: true })
  activo: boolean;
}

export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);