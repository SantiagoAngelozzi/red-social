import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PATRON_USUARIO = /^[a-zA-Z0-9_.]{3,20}$/;
export const PATRON_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export function passwordSegura(control: AbstractControl): ValidationErrors | null {
  const valor: string = control.value ?? '';
  if (!valor) return null;
  const errores: ValidationErrors = {};
  if (valor.length < 8) errores['largo'] = true;
  if (!/[A-Z]/.test(valor)) errores['mayuscula'] = true;
  if (!/\d/.test(valor)) errores['numero'] = true;
  return Object.keys(errores).length ? errores : null;
}

export function correoOUsuario(control: AbstractControl): ValidationErrors | null {
  const valor: string = (control.value ?? '').trim();
  if (!valor) return null;
  if (valor.includes('@')) {
    return PATRON_CORREO.test(valor) ? null : { correoInvalido: true };
  }
  return PATRON_USUARIO.test(valor) ? null : { usuarioInvalido: true };
}

export function passwordsIguales(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value;
  const repetir = grupo.get('repetirPassword')?.value;
  if (!repetir) return null;
  return password === repetir ? null : { passwordsDistintas: true };
}

export function edadMinima(minima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const nacimiento = new Date(`${control.value}T00:00:00`);
    const hoy = new Date();
    if (nacimiento > hoy) return { fechaFutura: true };

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

    return edad < minima ? { edadMinima: true } : null;
  };
}
