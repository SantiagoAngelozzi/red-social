import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaAuth } from '../models/usuario';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auth`;

  registrar(datos: FormData): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.api}/registro`, datos);
  }

  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.api}/login`, { identificador, password });
  }
}