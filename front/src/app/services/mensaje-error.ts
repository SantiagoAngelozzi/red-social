import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No pudimos conectar con el servidor. Revisá que el back esté prendido.';
  }
  if (error.status === 413) {
    return 'La imagen pesa más de 2 MB. Elegí una más liviana.';
  }
  const mensaje = error.error?.message;
  if (Array.isArray(mensaje)) return mensaje.join('. ');
  if (typeof mensaje === 'string') return mensaje;
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}
