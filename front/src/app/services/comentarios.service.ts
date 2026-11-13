import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, RespuestaComentarios } from '../models/comentario';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(publicacionId: string, offset: number, limit: number): Observable<RespuestaComentarios> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<RespuestaComentarios>(`${this.api}/publicaciones/${publicacionId}/comentarios`, { params });
  }

   crear(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.api}/publicaciones/${publicacionId}/comentarios`, { mensaje });
  }

  editar(id: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.api}/comentarios/${id}`, { mensaje });
  }
}
