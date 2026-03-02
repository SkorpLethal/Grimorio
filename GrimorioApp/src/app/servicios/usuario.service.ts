import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDTO } from '../dtos/LoginDTO';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
   private backendUrl = 'http://localhost:5069/api/usuarios';

  constructor(private http: HttpClient) { }

  //not done as observable
  iniciarSesion(loginDTO : LoginDTO) {
    

    return this.http.post<any>(`${this.backendUrl}/IniciarSesion`, loginDTO);
  }
}
