import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { CrearPublicacion } from '../../components/crear-publicacion/crear-publicacion';
import { Modal } from '../../shared/modal/modal';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const POR_PAGINA = 10;

@Component({
  selector: 'app-publicaciones',
  imports: [PublicacionCard, CrearPublicacion, Modal],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit, OnDestroy {
  private readonly publicacionesService = inject(PublicacionesService);
  readonly sesion = inject(SesionService);

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<OrdenPublicaciones>('fecha');
  pagina = signal(1);
  cargando = signal(false);
  error = signal<string | null>(null);
  aviso = signal<string | null>(null);
  procesando = signal<string | null>(null);

  aEliminar = signal<Publicacion | null>(null);
  eliminando = signal(false);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  private temporizadorAviso?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorAviso);
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina()) return;
    this.pagina.set(pagina);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const offset = (this.pagina() - 1) * POR_PAGINA;
    this.publicacionesService.listar({ orden: this.orden(), offset, limit: POR_PAGINA }).subscribe({
      next: (respuesta) => {
        if (respuesta.publicaciones.length === 0 && this.pagina() > 1) {
          this.pagina.update((p) => p - 1);
          this.cargar();
          return;
        }
        this.publicaciones.set(respuesta.publicaciones);
        this.total.set(respuesta.total);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  alPublicar(): void {
    this.orden.set('fecha');
    this.pagina.set(1);
    this.cargar();
    this.mostrarAviso('Publicación creada.');
  }

  alternarMeGusta(publicacion: Publicacion): void {
    const usuario = this.sesion.usuario();
    if (!usuario || this.procesando()) return;

    const yaDado = publicacion.meGusta.includes(usuario._id);
    const pedido = yaDado
      ? this.publicacionesService.quitarMeGusta(publicacion._id, usuario._id)
      : this.publicacionesService.darMeGusta(publicacion._id, usuario._id);

    this.procesando.set(publicacion._id);
    this.error.set(null);

    pedido.subscribe({
      next: (actualizada) => {
        this.publicaciones.update((lista) =>
          lista.map((p) => (p._id === actualizada._id ? actualizada : p)),
        );
        this.procesando.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.procesando.set(null);
      },
    });
  }

  pedirEliminar(publicacion: Publicacion): void {
    this.aEliminar.set(publicacion);
  }

  cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.aEliminar.set(null);
  }

  confirmarEliminar(): void {
    const publicacion = this.aEliminar();
    const usuario = this.sesion.usuario();
    if (!publicacion || !usuario) return;

    this.eliminando.set(true);
    this.publicacionesService.eliminar(publicacion._id, usuario._id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.cargar();
        this.mostrarAviso('Publicación eliminada.');
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.error.set(mensajeDeError(error));
      },
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = setTimeout(() => this.aviso.set(null), 3000);
  }
}
