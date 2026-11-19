import { Component, inject } from '@angular/core';
import { Modal } from '../../shared/modal/modal';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-aviso-sesion',
  imports: [Modal],
  templateUrl: './aviso-sesion.html',
  styleUrl: './aviso-sesion.scss',
})
export class AvisoSesion {
  readonly sesion = inject(SesionService);
}