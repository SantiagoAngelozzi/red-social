import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(texto: string | null | undefined, largo = 50): string {
    if (!texto) return '';
    return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto;
  }
}