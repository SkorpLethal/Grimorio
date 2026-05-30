import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

// ── DTO ─────────────────────────────────────────────────────────────────────

export interface ReporteDTO {
  numeroDocumento: string;
  tipoPago:        string;
  fechaRegistro:   string;
  totalVenta:      number;
  carta:           string;
  cantidad:        number;
  precio:          number;
  total:           number;
}

// ── Servicio inline ──────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private api = 'http://localhost:5069/api/ventas';
  constructor(private http: HttpClient) {}

  reporte(
    fechaInicio: string,
    fechaFin: string
  ): Observable<{ status: boolean; value: ReporteDTO[]; msg: string }> {
    const params = `fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;
    return this.http.get<{ status: boolean; value: ReporteDTO[]; msg: string }>(
      `${this.api}/Reporte?${params}`
    );
  }
}

// ── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector:    'app-reportes',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl:    './reportes.css',
})
export class Reportes implements OnInit {

  // ── Filtros ──────────────────────────────────────────────────────────────
  fechaInicio: string = '';
  fechaFin:    string = '';

  // ── Resultados ────────────────────────────────────────────────────────────
  lineas:   ReporteDTO[] = [];
  cargando: boolean      = false;
  buscado:  boolean      = false;
  errorMsg: string       = '';

  constructor(
    private reporteService: ReporteService,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const hoy    = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = this.toInputDate(inicio);
    this.fechaFin    = this.toInputDate(hoy);
    this.buscar();
  }

  // ── Buscar ───────────────────────────────────────────────────────────────

  buscar(): void {
    this.errorMsg = '';
    this.lineas   = [];

    if (!this.fechaInicio || !this.fechaFin) {
      this.errorMsg = 'Selecciona ambas fechas para generar el reporte.';
      return;
    }
    if (new Date(this.fechaInicio) > new Date(this.fechaFin)) {
      this.errorMsg = 'La fecha de inicio no puede ser posterior a la fecha fin.';
      return;
    }

    this.cargando = true;
    this.buscado  = false;

    const fi = this.formatFecha(this.fechaInicio);
    const ff = this.formatFecha(this.fechaFin);

    this.reporteService.reporte(fi, ff).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.buscado  = true;
          if (res.status) {
            this.lineas = res.value ?? [];
          } else {
            this.errorMsg = res.msg || 'No se pudo obtener el reporte.';
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.buscado  = true;
          this.errorMsg = 'Error al conectar con el servidor.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  limpiar(): void {
    const hoy    = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = this.toInputDate(inicio);
    this.fechaFin    = this.toInputDate(hoy);
    this.lineas      = [];
    this.errorMsg    = '';
    this.buscado     = false;
  }

  // ── KPIs computados ───────────────────────────────────────────────────────

  get totalIngresos(): number {
    // TotalVenta está repetida por línea → tomamos el total de cada línea de detalle
    return this.lineas.reduce((acc, l) => acc + (l.total ?? 0), 0);
  }

  get totalUnidades(): number {
    return this.lineas.reduce((acc, l) => acc + (l.cantidad ?? 0), 0);
  }

  get ventasUnicas(): number {
    return new Set(this.lineas.map(l => l.numeroDocumento)).size;
  }

  get cartasMasVendidas(): { carta: string; unidades: number }[] {
    const mapa = new Map<string, number>();
    for (const l of this.lineas) {
      mapa.set(l.carta, (mapa.get(l.carta) ?? 0) + l.cantidad);
    }
    return Array.from(mapa.entries())
      .map(([carta, unidades]) => ({ carta, unidades }))
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);
  }

  get ingresosPorPago(): { tipo: string; total: number }[] {
    const mapa = new Map<string, number>();
    // Agrupamos por venta para no sumar el mismo total varias veces
    const ventasVistas = new Set<string>();
    for (const l of this.lineas) {
      if (!ventasVistas.has(l.numeroDocumento)) {
        ventasVistas.add(l.numeroDocumento);
        mapa.set(l.tipoPago, (mapa.get(l.tipoPago) ?? 0) + (l.totalVenta ?? 0));
      }
    }
    return Array.from(mapa.entries()).map(([tipo, total]) => ({ tipo, total }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatearPrecio(valor: number | undefined | null): string {
    if (valor == null) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(valor);
  }

  getTipoPagoClase(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'efectivo': return 'pago-efectivo';
      case 'tarjeta':  return 'pago-tarjeta';
      default:         return 'pago-otro';
    }
  }

  private toInputDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  private formatFecha(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  getRankClase(i: number): string {
  if (i === 0) return 'rank-1';
  if (i === 1) return 'rank-2';
  if (i === 2) return 'rank-3';
  return 'rank-other';
}

getBarWidth(unidades: number): number {
  const max = this.cartasMasVendidas[0]?.unidades ?? 1;
  return Math.round((unidades / max) * 100);
}

getPagoBarWidth(total: number): number {
  const max = Math.max(...this.ingresosPorPago.map(p => p.total), 1);
  return Math.round((total / max) * 100);
}
}
