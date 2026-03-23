import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashBoardDTO, CartaDTO, SetDTO, VentaDTO } from '../../../servicios/dashboard.service';

declare const ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {

  resumen: DashBoardDTO = {
    totalVentas: 0,
    totalIngresos: 0,
    totalCartas: 0,
    ventasUltimaSemana: [],
  };

  cartasBajoStock: CartaDTO[] = [];
  ultimasVentas: VentaDTO[] = [];
  totalSets: number = 0;
  cargando: boolean = true;
  errorMsg: string = '';

  private chartInstance: any = null;

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  cargarDatos(): void {
    this.cargando = true;

    // Resumen principal
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        if (res.status) {
          this.resumen = res.value;
          // Render chart after data arrives
          setTimeout(() => this.renderGrafico(), 100);
        }
      },
      error: () => {
        this.errorMsg = 'No se pudo conectar con el servidor.';
        this.cargando = false;
      },
    });

    // Cartas con bajo stock
    this.dashboardService.getCartas().subscribe({
      next: (res) => {
        if (res.status) {
          this.cartasBajoStock = res.value
            .filter((c) => c.esActivo && (c.stock ?? 0) <= 5)
            .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
            .slice(0, 8);
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });

    // Total sets
    this.dashboardService.getSets().subscribe({
      next: (res) => {
        if (res.status) {
          this.totalSets = res.value.length;
        }
      },
    });

    // Últimas ventas - buscamos por fecha de hoy hacia atrás (historial)
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    this.dashboardService
      .getHistorial('fecha', '', fmt(hace30), fmt(hoy))
      .subscribe({
        next: (res) => {
          if (res.status && res.value) {
            this.ultimasVentas = res.value.slice(0, 8);
          }
        },
      });
  }

  renderGrafico(): void {
    const el = document.getElementById('grimorio-chart');
    if (!el || typeof ApexCharts === 'undefined') return;

    const semana = this.resumen.ventasUltimaSemana ?? [];
    const categorias = semana.map((v) => v.fecha);
    const valores = semana.map((v) => v.total);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const options = {
      series: [{ name: 'Ventas', data: valores }],
      chart: {
        type: 'area',
        height: 280,
        background: 'transparent',
        toolbar: { show: false },
        sparkline: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2, colors: ['#c9a84c'] },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.02,
          stops: [0, 95, 100],
          colorStops: [
            { offset: 0,   color: '#c9a84c', opacity: 0.45 },
            { offset: 100, color: '#6b3fa0', opacity: 0.02 },
          ],
        },
      },
      xaxis: {
        categories: categorias,
        labels: { style: { colors: '#a090c0', fontFamily: 'Crimson Text, serif' } },
        axisBorder: { color: 'rgba(201,168,76,0.2)' },
        axisTicks: { color: 'rgba(201,168,76,0.2)' },
      },
      yaxis: {
        labels: {
          style: { colors: '#a090c0', fontFamily: 'Crimson Text, serif' },
          formatter: (v: number) => Math.round(v).toString(),
        },
      },
      grid: {
        borderColor: 'rgba(201,168,76,0.1)',
        strokeDashArray: 4,
      },
      markers: {
        size: 5,
        colors: ['#c9a84c'],
        strokeColors: '#1a1530',
        strokeWidth: 2,
        hover: { size: 8 },
      },
      tooltip: {
        theme: 'dark',
        style: { fontFamily: 'Crimson Text, serif' },
        y: { formatter: (v: number) => `${v} ventas` },
      },
    };

    this.chartInstance = new ApexCharts(el, options);
    this.chartInstance.render();
  }

  formatearPrecio(valor: number | undefined): string {
    if (valor === undefined || valor === null) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(valor);
  }

  getRarezaClase(stock: number): string {
    if (stock === 0) return 'stock-vacio';
    if (stock <= 2) return 'stock-critico';
    if (stock <= 5) return 'stock-bajo';
    return '';
  }
}
