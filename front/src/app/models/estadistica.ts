export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface RespuestaEstadistica<T> {
  desde: string;
  hasta: string;
  total: number;
  datos: T[];
}

export interface PublicacionesPorUsuario {
  usuarioId: string;
  nombreUsuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}