import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

const CLAVE_USUARIO = 'usuario';
const CLAVE_TOKEN = 'token';
const AVISO_ANTES_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());
  private readonly _token = signal<string | null>(this.leer(CLAVE_TOKEN));

  readonly usuario = this._usuario.asReadonly();
  readonly token = this._token.asReadonly();
  readonly avisoVencimiento = signal(false);
  readonly extendiendo = signal(false);
  validada = false;

  private temporizadorAviso?: ReturnType<typeof setTimeout>;
  private temporizadorFin?: ReturnType<typeof setTimeout>;

  constructor() {
    const vence = this.vencimiento();
    if (vence !== null && vence <= Date.now()) {
      this.cerrar();
    } else {
      this.programarVencimiento();
    }
  }

  iniciar(usuario: Usuario, token: string): void {
    this.actualizarUsuario(usuario);
    this.guardarToken(token);
    this.validada = true;
    this.programarVencimiento();
  }

  actualizarUsuario(usuario: Usuario): void {
    this._usuario.set(usuario);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  }

  cerrar(): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorFin);
    this.avisoVencimiento.set(false);
    this.validada = false;
    this._usuario.set(null);
    this._token.set(null);
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_TOKEN);
  }

  vencer(): void {
    this.cerrar();
    this.router.navigate(['/login'], { queryParams: { sesionVencida: 1 } });
  }

  extender(): void {
    this.extendiendo.set(true);
    this.authService.refrescar().subscribe({
      next: ({ token }) => {
        this.guardarToken(token);
        this.extendiendo.set(false);
        this.avisoVencimiento.set(false);
        this.programarVencimiento();
      },
      error: () => {
        this.extendiendo.set(false);
        this.vencer();
      },
    });
  }

  descartarAviso(): void {
    this.avisoVencimiento.set(false);
  }

  private guardarToken(token: string): void {
    this._token.set(token);
    localStorage.setItem(CLAVE_TOKEN, token);
  }

  private programarVencimiento(): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorFin);

    const vence = this.vencimiento();
    if (vence === null) return;

    const restante = vence - Date.now();
    this.temporizadorAviso = setTimeout(
      () => this.avisoVencimiento.set(true),
      Math.max(0, restante - AVISO_ANTES_MS),
    );
    this.temporizadorFin = setTimeout(() => this.vencer(), Math.max(0, restante));
  }

  private vencimiento(): number | null {
    const token = this._token();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
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