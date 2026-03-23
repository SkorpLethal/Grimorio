import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../servicios/usuario.service';
import { RegisterDTO } from '../dtos/RegisterDTO';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

public registro: RegisterDTO = {
    NombreCompleto: '',
    Correo: '',
    Clave: '',
    IdRol: 2  // Fijo como Empleado
  };

  public confirmarClave: string = '';
  public errorMensaje: string = '';

  registrar() {
    this.errorMensaje = '';

    if (this.registro.Clave !== this.confirmarClave) {
      this.errorMensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.usuarioService.crearUsuario(this.registro).subscribe({
      next: (res) => {
        if (res.status) {
          this.router.navigate(['/login']);
        } else {
          this.errorMensaje = res.msg || 'No se pudo crear el usuario.';
        }
      },
      error: (err) => {
        this.errorMensaje = 'Error al conectar con el servidor.';
        console.log(err);
      }
    });
  }
}
