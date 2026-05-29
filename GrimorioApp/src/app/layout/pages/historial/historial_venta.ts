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

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface DetalleVentaDTO {
  idCarta: number;
  descripcionCarta: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface VentaDTO {
  idVenta: number;
  numeroDocumento: string;
  tipoPago: string;
  total: number;
  fechaRegistro: string;
  detalleVenta: DetalleVentaDTO[] | null;
}

// ── Servicio inline ──────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private api = 'http://localhost:5069/api/ventas';
  constructor(private http: HttpClient) {}

  historial(
    buscarPor: string,
    numeroVenta: string,
    fechaInicio: string,
    fechaFin: string
  ): Observable<{ status: boolean; value: VentaDTO[]; msg: string }> {
    const params = `buscarPor=${buscarPor}&numeroVenta=${encodeURIComponent(numeroVenta)}&fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;
    return this.http.get<{ status: boolean; value: VentaDTO[]; msg: string }>(
      `${this.api}/Historial?${params}`
    );
  }
}

// ── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-historial-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial_venta.html',
  styleUrl: './historial_venta.css',
})
export class HistorialVenta implements OnInit {

  // ── Modo de búsqueda ────────────────────────────────────
  modoBusqueda: 'fecha' | 'numero' = 'fecha';

  // ── Filtros fecha ───────────────────────────────────────
  fechaInicio: string = '';
  fechaFin:    string = '';

  // ── Filtro número ───────────────────────────────────────
  numeroVenta: string = '';

  // ── Resultados ──────────────────────────────────────────
  ventas:   VentaDTO[] = [];
  cargando: boolean    = false;
  buscado:  boolean    = false;
  errorMsg: string     = '';

  // ── Fila expandida ──────────────────────────────────────
  ventaExpandida: number | null = null;

  constructor(
    private historialService: HistorialService,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    // Inicializar rango de fechas al mes en curso
    const hoy    = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = this.toInputDate(inicio);
    this.fechaFin    = this.toInputDate(hoy);
  }

  // ── Buscar ───────────────────────────────────────────────

  buscar(): void {
    this.errorMsg = '';
    this.ventas   = [];

    // Validaciones
    if (this.modoBusqueda === 'numero' && !this.numeroVenta.trim()) {
      this.errorMsg = 'Introduce un número de documento para buscar.';
      return;
    }
    if (this.modoBusqueda === 'fecha') {
      if (!this.fechaInicio || !this.fechaFin) {
        this.errorMsg = 'Selecciona ambas fechas para buscar.';
        return;
      }
      if (new Date(this.fechaInicio) > new Date(this.fechaFin)) {
        this.errorMsg = 'La fecha de inicio no puede ser posterior a la fecha fin.';
        return;
      }
    }

    this.cargando = true;
    this.buscado  = false;
    this.ventaExpandida = null;

    const fi = this.modoBusqueda === 'fecha' ? this.formatFecha(this.fechaInicio) : '';
    const ff = this.modoBusqueda === 'fecha' ? this.formatFecha(this.fechaFin)    : '';
    const nv = this.modoBusqueda === 'numero' ? this.numeroVenta.trim() : '';

    this.historialService
      .historial(this.modoBusqueda, nv, fi, ff)
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.cargando = false;
            this.buscado  = true;
            if (res.status) {
              this.ventas = res.value ?? [];
            } else {
              this.errorMsg = res.msg || 'No se pudo obtener el historial.';
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
    this.fechaInicio    = this.toInputDate(inicio);
    this.fechaFin       = this.toInputDate(hoy);
    this.numeroVenta    = '';
    this.ventas         = [];
    this.errorMsg       = '';
    this.buscado        = false;
    this.ventaExpandida = null;
    this.modoBusqueda   = 'fecha';
  }

  // ── Expansión de filas ───────────────────────────────────

  toggleDetalle(idVenta: number): void {
    this.ventaExpandida = this.ventaExpandida === idVenta ? null : idVenta;
  }

  estaExpandida(idVenta: number): boolean {
    return this.ventaExpandida === idVenta;
  }

  // ── Totales ──────────────────────────────────────────────

  get totalGeneral(): number {
    return this.ventas.reduce((acc, v) => acc + (v.total ?? 0), 0);
  }

  get totalUnidades(): number {
    return this.ventas.reduce((acc, v) => {
      const unidades = (v.detalleVenta ?? []).reduce((s, d) => s + (d.cantidad ?? 0), 0);
      return acc + unidades;
    }, 0);
  }

  // ── Helpers ──────────────────────────────────────────────

  formatearPrecio(valor: number | undefined | null): string {
    if (valor === undefined || valor === null) return '—';
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

  /** Convierte Date a string 'YYYY-MM-DD' para input[type=date] */
  private toInputDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  /** Convierte 'YYYY-MM-DD' al formato 'dd/MM/yyyy' que espera el backend */
  private formatFecha(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
