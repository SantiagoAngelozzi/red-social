import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const sesionGuard: CanActivateFn = (_ruta, estado) => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  if (!sesion.token()) {
    return router.createUrlTree(['/login']);
  }

  if (!sesion.validada) {
    return router.createUrlTree(['/'], { queryParams: { destino: estado.url } });
  }

  return true;
};
