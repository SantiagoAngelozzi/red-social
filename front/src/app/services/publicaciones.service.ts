import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrdenPublicaciones, RespuestaPublicaciones } from '../models/publicacion';

export interface FiltrosPublicaciones {
  orden?: OrdenPublicaciones;
  autor?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/publicaciones`;

  listar(filtros: FiltrosPublicaciones = {}): Observable<RespuestaPublicaciones> {
    let params = new HttpParams();
    if (filtros.orden) params = params.set('orden', filtros.orden);
    if (filtros.autor) params = params.set('autor', filtros.autor);
    if (filtros.offset !== undefined) params = params.set('offset', filtros.offset);
    if (filtros.limit !== undefined) params = params.set('limit', filtros.limit);

    return this.http.get<RespuestaPublicaciones>(this.api, { params });
  }
}