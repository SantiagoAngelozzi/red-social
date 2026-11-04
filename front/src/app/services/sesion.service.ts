import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

const CLAVE = 'usuario';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _usuario = signal<Usuario | null>(this.leerGuardado());
  readonly usuario = this._usuario.asReadonly();

  iniciar(usuario: Usuario): void {
    this._usuario.set(usuario);
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
  }

  cerrar(): void {
    this._usuario.set(null);
    localStorage.removeItem(CLAVE);
  }

  private leerGuardado(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }
}