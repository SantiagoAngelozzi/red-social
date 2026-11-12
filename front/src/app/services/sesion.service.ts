import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

const CLAVE_USUARIO = 'usuario';
const CLAVE_TOKEN = 'token';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());
  private readonly _token = signal<string | null>(this.leer(CLAVE_TOKEN));

  readonly usuario = this._usuario.asReadonly();
  readonly token = this._token.asReadonly();

  iniciar(usuario: Usuario, token: string): void {
    this._usuario.set(usuario);
    this._token.set(token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    localStorage.setItem(CLAVE_TOKEN, token);
  }

  cerrar(): void {
    this._usuario.set(null);
    this._token.set(null);
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_TOKEN);
  }

  private leerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }

  private leer(clave: string): string | null {
    try {
      return localStorage.getItem(clave);
    } catch {
      return null;
    }
  }
}