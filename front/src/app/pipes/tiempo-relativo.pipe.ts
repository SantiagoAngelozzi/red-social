import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);

    if (segundos < 60) return 'hace un momento';

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;

    return new Date(fecha).toLocaleDateString('es-AR');
  }
}