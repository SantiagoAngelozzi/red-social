import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { ComentarioItem } from '../../components/comentario-item/comentario-item';
import { Modal } from '../../shared/modal/modal';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const POR_TANDA = 5;
const MAX_COMENTARIO = 300;

@Component({
  selector: 'app-detalle-publicacion',
  imports: [ReactiveFormsModule, RouterLink, PublicacionCard, ComentarioItem, Modal],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.scss',
})
export class DetallePublicacion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  readonly sesion = inject(SesionService);

  readonly maxComentario = MAX_COMENTARIO;
  private id = '';

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  procesandoMeGusta = signal(false);

  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  cargandoComentarios = signal(false);
  errorComentarios = signal<string | null>(null);
  hayMas = computed(() => this.comentarios().length < this.totalComentarios());

  form = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_COMENTARIO)]],
  });
  enviado = signal(false);
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  confirmandoEliminar = signal(false);
  eliminando = signal(false);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    this.publicacionesService.buscarUna(this.id).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.cargando.set(false);
        this.cargarComentarios();
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  cargarComentarios(): void {
    this.cargandoComentarios.set(true);
    this.errorComentarios.set(null);

    const offset = this.comentarios().length;
    this.comentariosService.listar(this.id, offset, POR_TANDA).subscribe({
      next: (respuesta) => {
        this.comentarios.update((lista) => {
          const nuevos = respuesta.comentarios.filter((c) => !lista.some((viejo) => viejo._id === c._id));
          return [...lista, ...nuevos];
        });
        this.totalComentarios.set(respuesta.total);
        this.cargandoComentarios.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorComentarios.set(mensajeDeError(error));
        this.cargandoComentarios.set(false);
      },
    });
  }

  mostrarErrorMensaje(): boolean {
    const control = this.form.controls.mensaje;
    return control.invalid && (control.touched || this.enviado());
  }

  comentar(): void {
    this.enviado.set(true);
    this.errorEnvio.set(null);

    const usuario = this.sesion.usuario();
    if (!usuario || this.form.invalid) return;

    const mensaje = this.form.controls.mensaje.value.trim();
    this.enviando.set(true);

    this.comentariosService.crear(this.id, usuario._id, mensaje).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.totalComentarios.update((total) => total + 1);
        this.form.reset();
        this.enviado.set(false);
        this.enviando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorEnvio.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  alEditar(actualizado: Comentario): void {
    this.comentarios.update((lista) => lista.map((c) => (c._id === actualizado._id ? actualizado : c)));
  }

  alternarMeGusta(): void {
    const publicacion = this.publicacion();
    const usuario = this.sesion.usuario();
    if (!publicacion || !usuario || this.procesandoMeGusta()) return;

    const yaDado = publicacion.meGusta.includes(usuario._id);
    const pedido = yaDado
      ? this.publicacionesService.quitarMeGusta(publicacion._id, usuario._id)
      : this.publicacionesService.darMeGusta(publicacion._id, usuario._id);

    this.procesandoMeGusta.set(true);
    pedido.subscribe({
      next: (actualizada) => {
        this.publicacion.set(actualizada);
        this.procesandoMeGusta.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorEnvio.set(mensajeDeError(error));
        this.procesandoMeGusta.set(false);
      },
    });
  }

  cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.confirmandoEliminar.set(false);
  }

  confirmarEliminar(): void {
    const publicacion = this.publicacion();
    const usuario = this.sesion.usuario();
    if (!publicacion || !usuario) return;

    this.eliminando.set(true);
    this.publicacionesService.eliminar(publicacion._id, usuario._id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.confirmandoEliminar.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.confirmandoEliminar.set(false);
        this.errorEnvio.set(mensajeDeError(error));
      },
    });
  }
}
