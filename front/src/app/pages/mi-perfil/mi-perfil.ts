import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const CANTIDAD_ULTIMAS = 3;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  readonly sesion = inject(SesionService);

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const usuario = this.sesion.usuario();
    if (!usuario) return;

    this.cargando.set(true);
    this.publicacionesService.listar({ autor: usuario._id, limit: CANTIDAD_ULTIMAS }).subscribe({
      next: (respuesta) => {
        this.ultimas.set(respuesta.publicaciones);
        this.totalPublicaciones.set(respuesta.total);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }
}