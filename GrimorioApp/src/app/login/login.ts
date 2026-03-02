import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../servicios/usuario.service';
import { LoginDTO } from '../dtos/LoginDTO';


@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor (
    private usuarioService : UsuarioService, 
    private router : Router
  ){ }
  

  public login : LoginDTO = {
    Correo : "admin@admin.com",
    Clave : "admin"
  }

  iniciarSesion(){
    this.usuarioService.iniciarSesion(this.login).subscribe({next : (res) => {
      console.log(res)

      if(res.status){
        this.router.navigate(["pages/dashboard"])
      }
      
    }, error : (err) => {
      console.log(err)
    }})
  }

}

