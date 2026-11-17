import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Grafico } from '../../components/grafico/grafico';
import { EstadisticasService } from '../../services/estadisticas.service';
import { mensajeDeError } from '../../services/mensaje-error';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
} from '../../models/estadistica';

const PORCIONES_TORTA = 5;

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function haceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fechaLocal(fecha);
}

const rangoValido: ValidatorFn = (grupo) => {
  const { desde, hasta } = grupo.value;
  return desde && hasta && desde > hasta ? { rangoInvalido: true } : null;
};

@Component({
  selector: 'app-estadisticas',
  imports: [ReactiveFormsModule, Grafico],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.scss',
})
export class Estadisticas implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly estadisticasService = inject(EstadisticasService);

  readonly hoy = fechaLocal(new Date());
  readonly opcionesRapidas = [7, 30, 90];

  form = this.fb.nonNullable.group(
    {
      desde: [haceDias(29), Validators.required],
      hasta: [this.hoy, Validators.required],
    },
    { validators: rangoValido },
  );

  cargando = signal(false);
  error = signal<string | null>(null);
  rango = signal<RangoFechas | null>(null);

  porUsuario = signal<PublicacionesPorUsuario[]>([]);
  porDia = signal<ComentariosPorDia[]>([]);
  porPublicacion = signal<ComentariosPorPublicacion[]>([]);
  totalPublicaciones = signal(0);
  totalComentarios = signal(0);

  barras = computed(() => ({
    etiquetas: this.porUsuario().map((dato) => `@${dato.nombreUsuario}`),
    valores: this.porUsuario().map((dato) => dato.cantidad),
  }));

  lineas = computed(() => ({
    etiquetas: this.porDia().map((dato) => `${dato.fecha.slice(8, 10)}/${dato.fecha.slice(5, 7)}`),
    valores: this.porDia().map((dato) => dato.cantidad),
  }));

  torta = computed(() => {
    const principales = this.porPublicacion().slice(0, PORCIONES_TORTA);
    const resto = this.porPublicacion()
      .slice(PORCIONES_TORTA)
      .reduce((suma, dato) => suma + dato.cantidad, 0);

    const etiquetas = principales.map((dato) => dato.titulo);
    const valores = principales.map((dato) => dato.cantidad);
    if (resto > 0) {
      etiquetas.push('Otras');
      valores.push(resto);
    }
    return { etiquetas, valores };
  });

  ngOnInit(): void {
    this.cargar();
  }

  ultimosDias(dias: number): void {
    this.form.setValue({ desde: haceDias(dias - 1), hasta: this.hoy });
    this.cargar();
  }

  cargar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rango = this.form.getRawValue();
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      porUsuario: this.estadisticasService.publicacionesPorUsuario(rango),
      porDia: this.estadisticasService.comentariosPorDia(rango),
      porPublicacion: this.estadisticasService.comentariosPorPublicacion(rango),
    }).subscribe({
      next: ({ porUsuario, porDia, porPublicacion }) => {
        this.porUsuario.set(porUsuario.datos);
        this.porDia.set(porDia.datos);
        this.porPublicacion.set(porPublicacion.datos);
        this.totalPublicaciones.set(porUsuario.total);
        this.totalComentarios.set(porDia.total);
        this.rango.set({ desde: porDia.desde, hasta: porDia.hasta });
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  formatear(fecha: string): string {
    return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}`;
  }
}
