import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true, index: true })
  publicacion: Types.ObjectId;

  @Prop({ default: false })
  modificado: boolean;
}

export type ComentarioDocument = HydratedDocument<Comentario>;
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);