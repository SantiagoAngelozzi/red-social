import { Component, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { mensajeDeError } from '../../services/mensaje-error';
import {
  edadMinima,
  PATRON_CORREO,
  PATRON_SOLO_LETRAS,
  PATRON_USUARIO,
  passwordSegura,
  passwordsIguales,
} from '../../validators/validadores';

type CampoUsuario =
  | 'nombre'
  | 'apellido'
  | 'correo'
  | 'nombreUsuario'
  | 'password'
  | 'repetirPassword'
  | 'fechaNacimiento'
  | 'descripcion';

const TIPOS_DE_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const PESO_MAXIMO_MB = 2;

@Component({
  selector: 'app-form-usuario',
  imports: [ReactiveFormsModule],
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.scss',
})
export class FormUsuario {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  creado = output<Usuario>();
  cancelado = output<void>();

  readonly hoy = new Date().toISOString().slice(0, 10);

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_SOLO_LETRAS)]],
      apellido: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_SOLO_LETRAS)]],
      correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
      nombreUsuario: ['', [Validators.required, Validators.pattern(PATRON_USUARIO)]],
      password: ['', [Validators.required, Validators.maxLength(64), passwordSegura]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
      descripcion: ['', Validators.maxLength(200)],
      perfil: this.fb.nonNullable.control<'usuario' | 'administrador'>('usuario'),
    },
    { validators: passwordsIguales },
  );

  imagen = signal<File | null>(null);
  errorImagen = signal<string | null>(null);
  enviado = signal(false);
  cargando = signal(false);
  errorServidor = signal<string | null>(null);

  mostrarError(campo: CampoUsuario): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  passwordsDistintas(): boolean {
    const control = this.form.controls.repetirPassword;
    return this.form.hasError('passwordsDistintas') && (control.touched || this.enviado());
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
  }

  guardar(): void {
    this.enviado.set(true);
    this.errorServidor.set(null);
    if (this.form.invalid) return;

    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', valores.nombre.trim());
    datos.append('apellido', valores.apellido.trim());
    datos.append('correo', valores.correo.trim());
    datos.append('nombreUsuario', valores.nombreUsuario.trim());
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('perfil', valores.perfil);
    if (valores.descripcion.trim()) {
      datos.append('descripcion', valores.descripcion.trim());
    }
    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagenPerfil', imagen);
    }

    this.cargando.set(true);
    this.usuariosService.crear(datos).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        this.creado.emit(usuario);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      },
    });
  }
}
