export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil: string | null;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string | null;
  autor: AutorPublicacion;
  meGusta: string[];
  cantidadMeGusta: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';