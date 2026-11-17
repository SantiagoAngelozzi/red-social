import { afterRenderEffect, Component, ElementRef, input, viewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';

const AZUL = '#1e7bff';
const NARANJA = '#ff8a1f';
const FONDO = '#121f45';
const GRILLA = 'rgba(38, 57, 122, 0.6)';
const COLORES_TORTA = ['#1e7bff', '#ff8a1f', '#ffd23f', '#3ddc97', '#6fb1ff', '#ff4d6d'];

Chart.defaults.color = '#8fa3d1';
Chart.defaults.font.family = "'Rubik', system-ui, sans-serif";

export type TipoGrafico = 'bar' | 'line' | 'pie';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.html',
  styleUrl: './grafico.scss',
})
export class Grafico {
  tipo = input.required<TipoGrafico>();
  etiquetas = input.required<string[]>();
  valores = input.required<number[]>();
  nombreSerie = input('Cantidad');

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  constructor() {
    afterRenderEffect((onCleanup) => {
      const grafico = new Chart(this.lienzo().nativeElement, this.configuracion());
      onCleanup(() => grafico.destroy());
    });
  }

  private configuracion(): ChartConfiguration {
    const tipo = this.tipo();
    const esTorta = tipo === 'pie';
    const esLinea = tipo === 'line';

    return {
      type: tipo,
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            label: this.nombreSerie(),
            data: this.valores(),
            backgroundColor: esTorta ? COLORES_TORTA : esLinea ? 'rgba(30, 123, 255, 0.2)' : NARANJA,
            borderColor: esTorta ? FONDO : esLinea ? AZUL : NARANJA,
            borderWidth: 2,
            borderRadius: tipo === 'bar' ? 8 : 0,
            fill: esLinea,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: esTorta, position: 'bottom' },
        },
        scales: esTorta
          ? {}
          : {
              x: { grid: { color: GRILLA } },
              y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: GRILLA } },
            },
      },
    };
  }
}