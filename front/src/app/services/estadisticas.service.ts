import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
  RespuestaEstadistica,
} from '../models/estadistica';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(rango: RangoFechas): Observable<RespuestaEstadistica<PublicacionesPorUsuario>> {
    return this.http.get<RespuestaEstadistica<PublicacionesPorUsuario>>(`${this.api}/publicaciones-por-usuario`, {
      params: this.params(rango),
    });
  }

  comentariosPorDia(rango: RangoFechas): Observable<RespuestaEstadistica<ComentariosPorDia>> {
    return this.http.get<RespuestaEstadistica<ComentariosPorDia>>(`${this.api}/comentarios-por-dia`, {
      params: this.params(rango),
    });
  }

  comentariosPorPublicacion(rango: RangoFechas): Observable<RespuestaEstadistica<ComentariosPorPublicacion>> {
    return this.http.get<RespuestaEstadistica<ComentariosPorPublicacion>>(`${this.api}/comentarios-por-publicacion`, {
      params: this.params(rango),
    });
  }

  private params({ desde, hasta }: RangoFechas): HttpParams {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}