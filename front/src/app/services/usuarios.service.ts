import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.api);
  }

  crear(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.api, datos);
  }

  deshabilitar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.api}/${id}`);
  }

  habilitar(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/${id}/habilitar`, {});
  }

  editarPerfil(datos: FormData): Observable<Usuario> {
    return this.http.patch<Usuario>(`${environment.apiUrl}/perfil`, datos);
  }
}
