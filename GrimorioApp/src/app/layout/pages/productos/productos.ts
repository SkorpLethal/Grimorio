import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import {
  CartaService,
  CartaDTO,
  SetDTO,
} from '../../../servicios/carta.service';
import { Observable } from 'rxjs';

interface CartaForm {
  idCarta:  number;
  nombre:   string;
  idSet:    number | null;
  stock:    number | null;
  precio:   number | null;
  esActivo: boolean;
}

@Component({
  selector:    'app-productos',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl:    './productos.css',
})
export class Productos implements OnInit {

  // ── Estado principal ─────────────────────────────────────
  cartas:   CartaDTO[] = [];
  sets:     SetDTO[]   = [];
  cargando: boolean    = true;
  errorMsg: string     = '';

  // ── Filtros ──────────────────────────────────────────────
  filtroBusqueda: string   = '';
  filtroSet:      number   = 0;
  filtroEstado:   string   = 'todos';

  // ── Modal crear/editar ───────────────────────────────────
  modalVisible: boolean   = false;
  modoEdicion:  boolean   = false;
  guardando:    boolean   = false;
  errorModal:   string    = '';

  formulario: CartaForm = this.formVacio();

  // ── Confirmación de eliminación ──────────────────────────
  confirmarEliminarVisible: boolean   = false;
  cartaAEliminar: CartaDTO | null     = null;

  constructor(
    private cartaService: CartaService,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Carga ────────────────────────────────────────────────

  cargarDatos(): void {
    this.cargando = true;

    this.cartaService.lista().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) this.cartas = res.value;
          else this.errorMsg = 'No se pudo obtener el catálogo de cartas.';
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

    this.cartaService.listaSets().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) this.sets = res.value;
          this.cdr.detectChanges();
        });
      },
      error: () => {},
    });
  }

  // ── Filtrado ─────────────────────────────────────────────

  get cartasFiltradas(): CartaDTO[] {
    const q = this.filtroBusqueda.toLowerCase().trim();

    return this.cartas.filter((c) => {
      const coincideTexto =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.descripcionSet?.toLowerCase().includes(q);

      const coincideSet =
        !this.filtroSet || c.idSet === this.filtroSet;

      const coincideEstado =
        this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activo'   && c.esActivo)  ||
        (this.filtroEstado === 'inactivo' && !c.esActivo) ||
        (this.filtroEstado === 'sinstock' && c.stock === 0);

      return coincideTexto && coincideSet && coincideEstado;
    });
  }

  // ── Modal crear ──────────────────────────────────────────

  abrirModalCrear(): void {
    this.modoEdicion  = false;
    this.formulario   = this.formVacio();
    this.errorModal   = '';
    this.modalVisible = true;
  }

  // ── Modal editar ─────────────────────────────────────────

  abrirModalEditar(c: CartaDTO): void {
    this.modoEdicion = true;
    this.formulario  = {
      idCarta:  c.idCarta,
      nombre:   c.nombre,
      idSet:    c.idSet,
      stock:    c.stock,
      precio:   c.precio,
      esActivo: c.esActivo,
    };
    this.errorModal   = '';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  // ── Guardar ──────────────────────────────────────────────

  guardar(): void {
    this.errorModal = '';

    if (!this.formulario.nombre?.trim()) {
      this.errorModal = 'El nombre de la carta es obligatorio.'; return;
    }
    if (!this.formulario.idSet) {
      this.errorModal = 'Selecciona un set.'; return;
    }
    if (this.formulario.stock === null || this.formulario.stock < 0) {
      this.errorModal = 'El stock debe ser 0 o mayor.'; return;
    }
    if (this.formulario.precio === null || this.formulario.precio < 0) {
      this.errorModal = 'El precio debe ser 0 o mayor.'; return;
    }

    this.guardando = true;

    const payload: Partial<CartaDTO> = {
      idCarta:  this.formulario.idCarta,
      nombre:   this.formulario.nombre,
      idSet:    this.formulario.idSet,
      stock:    this.formulario.stock!,
      precio:   this.formulario.precio!,
      esActivo: this.formulario.esActivo,
    };

    const peticion$ = this.modoEdicion
      ? this.cartaService.editar(payload)
      : this.cartaService.guardar(payload);

    peticion$.subscribe({
      next: (res : any ) => {
        this.ngZone.run(() => {
          this.guardando = false;
          if (res.status) {
            this.cerrarModal();
            this.cargarDatos();
          } else {
            this.errorModal = res.msg || 'No se pudo guardar la carta.';
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.guardando  = false;
          this.errorModal = 'Error al conectar con el servidor.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  // ── Eliminar ─────────────────────────────────────────────

  pedirConfirmacionEliminar(c: CartaDTO): void {
    this.cartaAEliminar          = c;
    this.confirmarEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.cartaAEliminar          = null;
    this.confirmarEliminarVisible = false;
  }

  confirmarEliminar(): void {
    if (!this.cartaAEliminar) return;

    this.cartaService.eliminar(this.cartaAEliminar.idCarta).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.confirmarEliminarVisible = false;
          this.cartaAEliminar           = null;
          if (res.status) {
            this.cargarDatos();
          } else {
            this.errorMsg = res.msg || 'No se pudo eliminar la carta.';
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

  private formVacio(): CartaForm {
    return {
      idCarta:  0,
      nombre:   '',
      idSet:    null,
      stock:    null,
      precio:   null,
      esActivo: true,
    };
  }

  getStockClase(stock: number): string {
    if (stock === 0)  return 'stock-vacio';
    if (stock <= 3)   return 'stock-critico';
    if (stock <= 10)  return 'stock-bajo';
    return 'stock-ok';
  }

  formatearPrecio(valor: number): string {
    if (valor === undefined || valor === null) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency', currency: 'EUR',
    }).format(valor);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroSet      = 0;
    this.filtroEstado   = 'todos';
  }
}
