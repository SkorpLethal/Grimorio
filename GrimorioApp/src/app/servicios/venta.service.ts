import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CartaDTO {
  idCarta: number;
  nombre: string;
  idSet: number;
  descripcionSet: string;
  stock: number;
  precio: number;
  esActivo: boolean;
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
export class VentaService {
  private apiBase = 'http://localhost:5069/api';

  constructor(private http: HttpClient) {}

  getCartas(): Observable<{ status: boolean; value: CartaDTO[] }> {
    return this.http.get<{ status: boolean; value: CartaDTO[] }>(
      `${this.apiBase}/cartas/Lista`
    );
  }

  registrar(venta: Partial<VentaDTO>): Observable<{ status: boolean; value: VentaDTO; msg: string }> {
    return this.http.post<{ status: boolean; value: VentaDTO; msg: string }>(
      `${this.apiBase}/ventas/Registrar`,
      venta
    );
  }
}
