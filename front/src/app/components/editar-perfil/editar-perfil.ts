import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { mensajeDeError } from '../../services/mensaje-error';
import { edadMinima, PATRON_SOLO_LETRAS } from '../../validators/validadores';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';

type CampoPerfil = 'nombre' | 'apellido' | 'fechaNacimiento' | 'descripcion';

const TIPOS_DE_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const PESO_MAXIMO_MB = 2;

@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, ImagenRespaldoDirective],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss',
})
export class EditarPerfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  usuario = input.required<Usuario>();
  guardado = output<Usuario>();
  cancelado = output<void>();

  readonly hoy = new Date().toISOString().slice(0, 10);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_SOLO_LETRAS)]],
    apellido: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_SOLO_LETRAS)]],
    fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
    descripcion: ['', Validators.maxLength(200)],
  });

  imagen = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal<string | null>(null);
  enviado = signal(false);
  guardando = signal(false);
  errorServidor = signal<string | null>(null);

  ngOnInit(): void {
    const usuario = this.usuario();
    this.form.setValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fechaNacimiento: usuario.fechaNacimiento.slice(0, 10),
      descripcion: usuario.descripcion ?? '',
    });
    this.vistaPrevia.set(usuario.imagenPerfil);
  }

  mostrarError(campo: CampoPerfil): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    this.errorImagen.set(null);
    if (!archivo) return;

    if (!TIPOS_DE_IMAGEN.includes(archivo.type)) {
      this.errorImagen.set('La imagen debe ser JPG, PNG o WEBP.');
      input.value = '';
      return;
    }
    if (archivo.size > PESO_MAXIMO_MB * 1024 * 1024) {
      this.errorImagen.set(`La imagen pesa más de ${PESO_MAXIMO_MB} MB.`);
      input.value = '';
      return;
    }

    this.imagen.set(archivo);
    const lector = new FileReader();
    lector.onload = () => this.vistaPrevia.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  guardar(): void {
    this.enviado.set(true);
    this.errorServidor.set(null);
    if (this.form.invalid) return;

    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', valores.nombre.trim());
    datos.append('apellido', valores.apellido.trim());
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion.trim());
    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagenPerfil', imagen);
    }

    this.guardando.set(true);
    this.usuariosService.editarPerfil(datos).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.guardado.emit(usuario);
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      },
    });
  }
}
