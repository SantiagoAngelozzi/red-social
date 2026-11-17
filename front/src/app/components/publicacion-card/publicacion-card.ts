import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, RouterLink, TiempoRelativoPipe, ImagenRespaldoDirective],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  usuarioId = input<string | null>(null);
  ocupado = input(false);
  mostrarAcciones = input(true);
  grande = input(false);
  esAdmin = input(false);
  tocarMeGusta = output<void>();
  tocarEliminar = output<void>();

  meGustaDado = computed(() => {
    const id = this.usuarioId();
    return id !== null && this.publicacion().meGusta.includes(id);
  });

  esMia = computed(() => this.publicacion().autor._id === this.usuarioId());

  puedeEliminar = computed(() => this.esMia() || this.esAdmin());
}
