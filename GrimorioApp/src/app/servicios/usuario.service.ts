import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';
import { RegisterDTO } from '../dtos/RegisterDTO';

export interface UsuarioDTO {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  idRol: number;
  descripcionRol: string;
  esActivo: boolean;
}

export interface RolDTO {
  idRol: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private backendUrl = 'http://localhost:5069/api/usuarios';
  private rolesUrl  = 'http://localhost:5069/api/roles';

  constructor(private http: HttpClient) {}

  // ── Auth ────────────────────────────────────────────────
  iniciarSesion(loginDTO: LoginDTO): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/IniciarSesion`, loginDTO);
  }

  crearUsuario(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/Guardar`, registerDTO);
  }

  // ── CRUD usuarios ────────────────────────────────────────
  lista(): Observable<{ status: boolean; value: UsuarioDTO[] }> {
    return this.http.get<{ status: boolean; value: UsuarioDTO[] }>(
      `${this.backendUrl}/Lista`
    );
  }

  guardar(usuario: Partial<UsuarioDTO> & { clave?: string }): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/Guardar`, usuario);
  }

  editar(usuario: Partial<UsuarioDTO> & { clave?: string }): Observable<any> {
    return this.http.put<any>(`${this.backendUrl}/Editar`, usuario);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.backendUrl}/Eliminar/${id}`);
  }

  // ── Roles ────────────────────────────────────────────────
  listaRoles(): Observable<{ status: boolean; value: RolDTO[] }> {
    return this.http.get<{ status: boolean; value: RolDTO[] }>(this.rolesUrl);
  }
}
