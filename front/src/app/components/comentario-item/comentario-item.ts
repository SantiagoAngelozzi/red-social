import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comentario } from '../../models/comentario';
import { ComentariosService } from '../../services/comentarios.service';
import { mensajeDeError } from '../../services/mensaje-error';

const MAX_MENSAJE = 300;

@Component({
  selector: 'app-comentario-item',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './comentario-item.html',
  styleUrl: './comentario-item.scss',
})
export class ComentarioItem {
  private readonly comentariosService = inject(ComentariosService);

  comentario = input.required<Comentario>();
  usuarioId = input<string | null>(null);
  permitirEditar = input(true);
  editado = output<Comentario>();

  readonly maxMensaje = MAX_MENSAJE;

  esMio = computed(() => this.comentario().autor._id === this.usuarioId());

  editando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  texto = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_MENSAJE)],
  });

  empezarEdicion(): void {
    this.texto.setValue(this.comentario().mensaje);
    this.error.set(null);
    this.editando.set(true);
  }

  cancelar(): void {
    this.editando.set(false);
    this.error.set(null);
  }

  guardar(): void {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;

    if (this.texto.invalid) {
      this.error.set('El comentario no puede quedar vacío.');
      return;
    }

    const mensaje = this.texto.value.trim();
    if (mensaje === this.comentario().mensaje) {
      this.editando.set(false);
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.comentariosService.editar(this.comentario()._id, mensaje).subscribe({
      next: (actualizado) => {
        this.guardando.set(false);
        this.editando.set(false);
        this.editado.emit(actualizado);
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(error));
      },
    });
  }
}
