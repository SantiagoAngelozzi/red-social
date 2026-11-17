import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormUsuario } from '../../components/form-usuario/form-usuario';
import { Modal } from '../../shared/modal/modal';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';
import { EdadPipe } from '../../pipes/edad.pipe';
import { TruncarPipe } from '../../pipes/truncar.pipe';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';

@Component({
  selector: 'app-usuarios',
  imports: [DatePipe, FormUsuario, Modal, EdadPipe, TruncarPipe, ImagenRespaldoDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit, OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  readonly sesion = inject(SesionService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  aviso = signal<string | null>(null);
  mostrandoFormulario = signal(false);

  aCambiar = signal<Usuario | null>(null);
  cambiando = signal(false);

  cantidadActivos = computed(() => this.usuarios().filter((usuario) => usuario.activo).length);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorAviso);
  }

  esYo(usuario: Usuario): boolean {
    return usuario._id === this.sesion.usuario()?._id;
  }

  alCrear(usuario: Usuario): void {
    this.usuarios.update((lista) => [usuario, ...lista]);
    this.mostrandoFormulario.set(false);
    this.mostrarAviso(`Se creó la cuenta de @${usuario.nombreUsuario}.`);
  }

  pedirCambio(usuario: Usuario): void {
    this.aCambiar.set(usuario);
  }

  cancelarCambio(): void {
    if (this.cambiando()) return;
    this.aCambiar.set(null);
  }

  confirmarCambio(): void {
    const usuario = this.aCambiar();
    if (!usuario) return;

    const pedido = usuario.activo
      ? this.usuariosService.deshabilitar(usuario._id)
      : this.usuariosService.habilitar(usuario._id);

    this.cambiando.set(true);
    pedido.subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
        this.cambiando.set(false);
        this.aCambiar.set(null);
        this.mostrarAviso(
          actualizado.activo
            ? `@${actualizado.nombreUsuario} fue habilitado.`
            : `@${actualizado.nombreUsuario} fue deshabilitado.`,
        );
      },
      error: (error: HttpErrorResponse) => {
        this.cambiando.set(false);
        this.aCambiar.set(null);
        this.error.set(mensajeDeError(error));
      },
    });
  }

  private mostrarAviso(texto: string): void {
    this.error.set(null);
    this.aviso.set(texto);
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = setTimeout(() => this.aviso.set(null), 3000);
  }
}
