import { Component, input, output } from '@angular/core';

export type TipoModal = 'info' | 'exito' | 'error' | 'peligro';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  host: {
    '(document:keydown.escape)': 'alApretarEscape()',
  },
})
export class Modal {
  abierto = input(false);
  titulo = input('');
  tipo = input<TipoModal>('info');
  cerrar = output<void>();

  alApretarEscape(): void {
    if (this.abierto()) {
      this.cerrar.emit();
    }
  }
}
