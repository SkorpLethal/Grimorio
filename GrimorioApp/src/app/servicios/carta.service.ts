import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CartaDTO {
  idCarta: number;
  nombre: string;
  idSet: number | null;
  descripcionSet: string;
  stock: number;
  precio: number;
  esActivo: boolean;
}

export interface SetDTO {
  idSet: number;
  nombre: string;
}

export interface ResponseApi {
  status: boolean,
  value: any,
  msg?: string
}

@Injectable({ providedIn: 'root' })
export class CartaService {
  private cartasUrl = 'http://localhost:5069/api/cartas';
  private setsUrl   = 'http://localhost:5069/api/sets';

  constructor(private http: HttpClient) {}

  lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(
      `${this.cartasUrl}/Lista`
    );
  }

  guardar(carta: Partial<CartaDTO>): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(
      `${this.cartasUrl}/Guardar`, carta
    );
  }

  editar(carta: Partial<CartaDTO>): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(
      `${this.cartasUrl}/Editar`, carta
    );
  }

  eliminar(id: number): Observable<ResponseApi> {
    return this.http.delete<ResponseApi>(
      `${this.cartasUrl}/Eliminar/${id}`
    );
  }

  listaSets(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(
      `${this.setsUrl}/Lista`
    );
  }
}
