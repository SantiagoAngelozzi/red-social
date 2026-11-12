import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { ComentarioItem } from '../../components/comentario-item/comentario-item';
import { Publicacion } from '../../models/publicacion';
import { RespuestaComentarios } from '../../models/comentario';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const CANTIDAD_ULTIMAS = 3;
const COMENTARIOS_POR_PUBLICACION = 3;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, PublicacionCard, ComentarioItem],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  readonly sesion = inject(SesionService);

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargando = signal(false);
  error = signal<string | null>(null);
  comentarios = signal<Record<string, RespuestaComentarios>>({});

  ngOnInit(): void {
    const usuario = this.sesion.usuario();
    if (!usuario) return;

    this.cargando.set(true);
    this.publicacionesService.listar({ autor: usuario._id, limit: CANTIDAD_ULTIMAS }).subscribe({
      next: (respuesta) => {
        this.ultimas.set(respuesta.publicaciones);
        this.totalPublicaciones.set(respuesta.total);
        this.cargando.set(false);
        respuesta.publicaciones.forEach((publicacion) => this.cargarComentarios(publicacion._id));
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  private cargarComentarios(publicacionId: string): void {
    this.comentariosService.listar(publicacionId, 0, COMENTARIOS_POR_PUBLICACION).subscribe({
      next: (respuesta) => {
        this.comentarios.update((mapa) => ({ ...mapa, [publicacionId]: respuesta }));
      },
      error: () => {
        this.comentarios.update((mapa) => ({
          ...mapa,
          [publicacionId]: { comentarios: [], total: 0, offset: 0, limit: COMENTARIOS_POR_PUBLICACION },
        }));
      },
    });
  }
}
