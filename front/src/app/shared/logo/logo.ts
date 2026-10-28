import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo {
  /** 'chico' para la barra lateral, 'grande' para el login */
  tamanio = input<'chico' | 'grande'>('chico');
}
