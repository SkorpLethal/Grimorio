import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VentaSemanaDTO {
  fecha: string;
  total: number;
}

export interface DashBoardDTO {
  totalVentas: number;
  totalIngresos: number;
  totalCartas: number;
  ventasUltimaSemana: VentaSemanaDTO[];
}

export interface CartaDTO {
  idCarta: number;
  nombre: string;
  idSet: number;
  descripcionSet: string;
  stock: number;
  precio: number;
  esActivo: boolean;
}

export interface SetDTO {
  idSet: number;
  nombre: string;
}

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
  detalleVenta: DetalleVentaDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiBase = 'http://localhost:5069/api';

  constructor(private http: HttpClient) {}

  getResumen(): Observable<{ status: boolean; value: DashBoardDTO }> {
    return this.http.get<{ status: boolean; value: DashBoardDTO }>(
      `${this.apiBase}/dashboards/Resumen`
    );
  }

  getCartas(): Observable<{ status: boolean; value: CartaDTO[] }> {
    return this.http.get<{ status: boolean; value: CartaDTO[] }>(
      `${this.apiBase}/cartas/Lista`
    );
  }

  getSets(): Observable<{ status: boolean; value: SetDTO[] }> {
    return this.http.get<{ status: boolean; value: SetDTO[] }>(
      `${this.apiBase}/sets/Lista`
    );
  }

  getHistorial(
    buscarPor: string,
    numeroVenta: string,
    fechaInicio: string,
    fechaFin: string
  ): Observable<{ status: boolean; value: VentaDTO[] }> {
    return this.http.get<{ status: boolean; value: VentaDTO[] }>(
      `${this.apiBase}/ventas/Historial?buscarPor=${buscarPor}&numeroVenta=${numeroVenta}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
  }
}
