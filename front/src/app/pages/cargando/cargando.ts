import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { Logo } from '../../shared/logo/logo';
import { AuthService } from '../../services/auth.service';
import { SesionService } from '../../services/sesion.service';

const TIEMPO_MINIMO_MS = 1200;

@Component({
  selector: 'app-cargando',
  imports: [Logo],
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss',
})
export class Cargando implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    if (!this.sesion.token()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    const destino = this.route.snapshot.queryParamMap.get('destino');
    const irA = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/publicaciones';

    forkJoin([this.authService.autorizar(), timer(TIEMPO_MINIMO_MS)]).subscribe({
      next: ([usuario]) => {
        this.sesion.actualizarUsuario(usuario);
        this.sesion.validada = true;
        this.router.navigateByUrl(irA, { replaceUrl: true });
      },
      error: () => {
        this.sesion.cerrar();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }
}
