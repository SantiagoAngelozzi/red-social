import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  autor: AutorPublicacion;
  publicacion: string;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
}
