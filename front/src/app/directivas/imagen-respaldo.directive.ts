import { Directive, ElementRef, HostListener, inject } from '@angular/core';

const IMAGEN_RESPALDO = '/avatar-respaldo.svg';

@Directive({ selector: 'img[appImagenRespaldo]' })
export class ImagenRespaldoDirective {
  private readonly imagen = inject<ElementRef<HTMLImageElement>>(ElementRef);

  @HostListener('error')
  alFallar(): void {
    if (!this.imagen.nativeElement.src.endsWith(IMAGEN_RESPALDO)) {
      this.imagen.nativeElement.src = IMAGEN_RESPALDO;
    }
  }
}