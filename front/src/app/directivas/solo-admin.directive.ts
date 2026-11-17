import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { SesionService } from '../services/sesion.service';

@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdminDirective {
  private readonly plantilla = inject(TemplateRef<unknown>);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly sesion = inject(SesionService);

  constructor() {
    effect(() => {
      this.contenedor.clear();
      if (this.sesion.usuario()?.perfil === 'administrador') {
        this.contenedor.createEmbeddedView(this.plantilla);
      }
    });
  }
}