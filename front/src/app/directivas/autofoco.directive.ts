import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appAutofoco]' })
export class AutofocoDirective implements AfterViewInit {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    this.elemento.nativeElement.focus();
  }
}