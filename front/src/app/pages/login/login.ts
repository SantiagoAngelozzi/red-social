import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Logo } from '../../shared/logo/logo';
import { AuthService } from '../../services/auth.service';
import { mensajeDeError } from '../../services/mensaje-error';
import { correoOUsuario, passwordSegura } from '../../validators/validadores';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sesion = inject(SesionService);

  form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required, correoOUsuario]],
    password: ['', [Validators.required, passwordSegura]],
  });

  enviado = signal(false);
  cargando = signal(false);
  errorServidor = signal<string | null>(null);

  recienRegistrado = this.route.snapshot.queryParamMap.has('registrado');
  sesionVencida = this.route.snapshot.queryParamMap.has('sesionVencida');

  mostrarError(campo: 'identificador' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  iniciarSesion(): void {
    this.enviado.set(true);
    this.errorServidor.set(null);
    if (this.form.invalid) return;

    this.cargando.set(true);
    const { identificador, password } = this.form.getRawValue();

    this.auth.login(identificador.trim(), password).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.sesion.iniciar(respuesta.usuario, respuesta.token);
        this.router.navigate(['/publicaciones']);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      },
    });
  }
}
