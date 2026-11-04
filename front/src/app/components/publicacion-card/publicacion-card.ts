import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  usuarioId = input<string | null>(null);
  ocupado = input(false);
  mostrarAcciones = input(true);
  tocarMeGusta = output<void>();
  tocarEliminar = output<void>();

  meGustaDado = computed(() => {
    const id = this.usuarioId();
    return id !== null && this.publicacion().meGusta.includes(id);
  });

  esMia = computed(() => this.publicacion().autor._id === this.usuarioId());
}
