import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const POR_PAGINA = 10;

@Component({
  selector: 'app-publicaciones',
  imports: [PublicacionCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  readonly sesion = inject(SesionService);

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<OrdenPublicaciones>('fecha');
  cargando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.publicacionesService.listar({ orden: this.orden(), limit: POR_PAGINA }).subscribe({
      next: (respuesta) => {
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
}