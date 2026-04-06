import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  DashBoardDTO,
  CartaDTO,
  VentaDTO,
} from '../../../servicios/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

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

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // ── Resumen principal ──
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) {
            this.resumen = { ...res.value };
          }
          this.cargando = false;
          this.cdr.detectChanges();
          // Dar un tick para que el DOM tenga el #grimorio-chart disponible
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMsg = 'No se pudo conectar con el servidor.';
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
    });

    // ── Cartas con bajo stock ──
    this.dashboardService.getCartas().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status && res.value) {
            this.cartasBajoStock = res.value
              .filter((c) => c.esActivo && (c.stock ?? 0) <= 5)
              .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
              .slice(0, 8);
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {},
    });

    // ── Total sets ──
    this.dashboardService.getSets().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status && res.value) {
            this.totalSets = res.value.length;
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {},
    });

    // ── Últimas ventas ──
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1
      ).padStart(2, '0')}/${d.getFullYear()}`;

    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);

    this.dashboardService
      .getHistorial('fecha', '', fmt(hace30), fmt(hoy))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.status && res.value) {
              this.ultimasVentas = res.value.slice(0, 8);
            }
            this.cdr.detectChanges();
          });
        },
        error: () => {},
      });
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
