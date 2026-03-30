import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import {
  UsuarioService,
  UsuarioDTO,
  RolDTO,
} from '../../../servicios/usuario.service';

interface UsuarioForm {
  idUsuario:      number;
  nombreCompleto: string;
  correo:         string;
  idRol:          number | null;
  clave:          string;
  confirmarClave: string;
  esActivo:       boolean;
}

@Component({
  selector:    'app-usuarios',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl:    './usuarios.css',
})
export class Usuarios implements OnInit {

  // ── Estado principal ─────────────────────────────────────
  usuarios:   UsuarioDTO[] = [];
  roles:      RolDTO[]     = [];
  cargando:   boolean      = true;
  errorMsg:   string       = '';

  // ── Filtro de búsqueda ───────────────────────────────────
  filtroBusqueda: string = '';

  // ── Modal ────────────────────────────────────────────────
  modalVisible:   boolean = false;
  modoEdicion:    boolean = false;
  guardando:      boolean = false;
  errorModal:     string  = '';

  formulario: UsuarioForm = this.formVacio();

  // ── Confirmación de eliminación ──────────────────────────
  confirmarEliminarVisible: boolean = false;
  usuarioAEliminar: UsuarioDTO | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Carga ────────────────────────────────────────────────

  cargarDatos(): void {
    this.cargando = true;

    this.usuarioService.lista().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) this.usuarios = res.value;
          else this.errorMsg = 'No se pudo obtener la lista de usuarios.';
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMsg = 'Error al conectar con el servidor.';
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
    });

    this.usuarioService.listaRoles().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) this.roles = res.value;
          this.cdr.detectChanges();
        });
      },
      error: () => {},
    });
  }

  // ── Filtro ───────────────────────────────────────────────

  get usuariosFiltrados(): UsuarioDTO[] {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) return this.usuarios;
    return this.usuarios.filter(
      (u) =>
        u.nombreCompleto.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.descripcionRol?.toLowerCase().includes(q),
    );
  }

  // ── Modal crear ──────────────────────────────────────────

  abrirModalCrear(): void {
    this.modoEdicion  = false;
    this.formulario   = this.formVacio();
    this.errorModal   = '';
    this.modalVisible = true;
  }

  // ── Modal editar ─────────────────────────────────────────

  abrirModalEditar(u: UsuarioDTO): void {
    this.modoEdicion = true;
    this.formulario  = {
      idUsuario:      u.idUsuario,
      nombreCompleto: u.nombreCompleto,
      correo:         u.correo,
      idRol:          u.idRol,
      clave:          '',
      confirmarClave: '',
      esActivo:       u.esActivo,
    };
    this.errorModal   = '';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  // ── Guardar (crear / editar) ─────────────────────────────

  guardar(): void {
    this.errorModal = '';

    // Validaciones
    if (!this.formulario.nombreCompleto?.trim()) {
      this.errorModal = 'El nombre es obligatorio.'; return;
    }
    if (!this.formulario.correo?.trim()) {
      this.errorModal = 'El correo es obligatorio.'; return;
    }
    if (!this.modoEdicion && !this.formulario.clave?.trim()) {
      this.errorModal = 'La contraseña es obligatoria.'; return;
    }
    if (this.formulario.clave && this.formulario.clave !== this.formulario.confirmarClave) {
      this.errorModal = 'Las contraseñas no coinciden.'; return;
    }
    if (!this.formulario.idRol) {
      this.errorModal = 'Selecciona un rol.'; return;
    }

    this.guardando = true;

    const payload: any = {
      idUsuario:      this.formulario.idUsuario,
      nombreCompleto: this.formulario.nombreCompleto,
      correo:         this.formulario.correo,
      idRol:          this.formulario.idRol,
      esActivo:       this.formulario.esActivo,
    };

    // Solo incluir clave si el usuario la ha introducido
    if (this.formulario.clave?.trim()) {
      payload['clave'] = this.formulario.clave;
    }

    const peticion$ = this.modoEdicion
      ? this.usuarioService.editar(payload)
      : this.usuarioService.guardar(payload);

    peticion$.subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.guardando = false;
          if (res.status) {
            this.cerrarModal();
            this.cargarDatos();
          } else {
            this.errorModal = res.msg || 'No se pudo guardar el usuario.';
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.guardando    = false;
          this.errorModal   = 'Error al conectar con el servidor.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  // ── Eliminar ─────────────────────────────────────────────

  pedirConfirmacionEliminar(u: UsuarioDTO): void {
    this.usuarioAEliminar        = u;
    this.confirmarEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.usuarioAEliminar        = null;
    this.confirmarEliminarVisible = false;
  }

  confirmarEliminar(): void {
    if (!this.usuarioAEliminar) return;

    this.usuarioService.eliminar(this.usuarioAEliminar.idUsuario).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.confirmarEliminarVisible = false;
          this.usuarioAEliminar         = null;
          if (res.status) {
            this.cargarDatos();
          } else {
            this.errorMsg = res.msg || 'No se pudo eliminar el usuario.';
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.confirmarEliminarVisible = false;
          this.errorMsg = 'Error al conectar con el servidor.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────

  private formVacio(): UsuarioForm {
    return {
      idUsuario:      0,
      nombreCompleto: '',
      correo:         '',
      idRol:          null,
      clave:          '',
      confirmarClave: '',
      esActivo:       true,
    };
  }

  getRolClase(descripcion: string): string {
    switch (descripcion?.toLowerCase()) {
      case 'administrador': return 'rol-admin';
      case 'supervisor':    return 'rol-supervisor';
      default:              return 'rol-empleado';
    }
  }
}
