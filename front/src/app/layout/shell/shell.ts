import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Logo } from '../../shared/logo/logo';
import { AvisoSesion } from '../../components/aviso-sesion/aviso-sesion';
import { SesionService } from '../../services/sesion.service';
import { SoloAdminDirective } from '../../directivas/solo-admin.directive';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, AvisoSesion, SoloAdminDirective, ImagenRespaldoDirective],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  readonly sesion = inject(SesionService);

  cerrarSesion(): void {
    this.sesion.cerrar();
    this.router.navigate(['/login']);
  }
}