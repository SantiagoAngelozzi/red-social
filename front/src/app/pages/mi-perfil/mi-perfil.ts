import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { EdadPipe } from '../../pipes/edad.pipe';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';
import { EditarPerfil } from '../../components/editar-perfil/editar-perfil';
import { Usuario } from '../../models/usuario';

const CANTIDAD_ULTIMAS = 3;
const COMENTARIOS_POR_PUBLICACION = 3;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, PublicacionCard, ComentarioItem, EdadPipe, ImagenRespaldoDirective, EditarPerfil],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit, OnDestroy {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  readonly sesion = inject(SesionService);

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargando = signal(false);
  error = signal<string | null>(null);
  comentarios = signal<Record<string, RespuestaComentarios>>({});
  editando = signal(false);
  aviso = signal<string | null>(null);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorAviso);
  }

  alGuardar(usuario: Usuario): void {
    this.sesion.actualizarUsuario(usuario);
    this.editando.set(false);
    this.cargar();
    this.aviso.set('Perfil actualizado.');
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = setTimeout(() => this.aviso.set(null), 3000);
  }

  private cargar(): void {
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
