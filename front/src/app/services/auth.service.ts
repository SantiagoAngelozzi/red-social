import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api/auth';

  registrar(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/registro`, datos);
  }

  login(identificador: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/login`, { identificador, password });
  }
}
