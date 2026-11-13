import { Component, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { SesionService } from '../../services/sesion.service';
import { mensajeDeError } from '../../services/mensaje-error';

const MAX_TITULO = 80;
const MAX_MENSAJE = 500;
const TIPOS_DE_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const PESO_MAXIMO_MB = 2;

@Component({
  selector: 'app-crear-publicacion',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-publicacion.html',
  styleUrl: './crear-publicacion.scss',
})
export class CrearPublicacion {
  private readonly fb = inject(FormBuilder);
  private readonly publicacionesService = inject(PublicacionesService);
  readonly sesion = inject(SesionService);

  publicada = output<Publicacion>();

  readonly maxTitulo = MAX_TITULO;
  readonly maxMensaje = MAX_MENSAJE;

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(MAX_TITULO)]],
    mensaje: ['', [Validators.required, Validators.maxLength(MAX_MENSAJE)]],
  });

  imagen = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal<string | null>(null);

  enviado = signal(false);
  cargando = signal(false);
  errorServidor = signal<string | null>(null);

  mostrarError(campo: 'titulo' | 'mensaje'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    this.errorImagen.set(null);
    if (!archivo) return;

    if (!TIPOS_DE_IMAGEN.includes(archivo.type)) {
      this.errorImagen.set('La imagen debe ser JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > PESO_MAXIMO_MB * 1024 * 1024) {
      this.errorImagen.set(`La imagen pesa más de ${PESO_MAXIMO_MB} MB. Elegí una más liviana.`);
      return;
    }

    this.imagen.set(archivo);
    const lector = new FileReader();
    lector.onload = () => this.vistaPrevia.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  quitarImagen(): void {
    this.imagen.set(null);
    this.vistaPrevia.set(null);
  }

  publicar(): void {
    this.enviado.set(true);
    this.errorServidor.set(null);

    const usuario = this.sesion.usuario();
    if (!usuario) {
      this.errorServidor.set('Tenés que iniciar sesión para publicar.');
      return;
    }
    if (this.form.invalid) return;

    const { titulo, mensaje } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo.trim());
    datos.append('mensaje', mensaje.trim());
    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagen', imagen);
    }

    this.cargando.set(true);
    this.publicacionesService.crear(datos).subscribe({
      next: (publicacion) => {
        this.cargando.set(false);
        this.form.reset();
        this.quitarImagen();
        this.enviado.set(false);
        this.publicada.emit(publicacion);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      },
    });
  }
}
