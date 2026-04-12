import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, CartaDTO, DetalleVentaDTO } from '../../../servicios/venta.service';

interface ItemCarrito {
  carta: CartaDTO;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Venta implements OnInit {

  // ── Catálogo ────────────────────────────────────────────
  cartas: CartaDTO[] = [];
  cartasFiltradas: CartaDTO[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = true;
  errorMsg: string = '';

  // ── Carrito ──────────────────────────────────────────────
  carrito: ItemCarrito[] = [];
  tipoPago: string = 'Efectivo';
  tiposPago: string[] = ['Efectivo', 'Tarjeta'];

  // ── Estado de la venta ───────────────────────────────────
  registrando: boolean = false;
  errorVenta: string = '';

  // ── Modal de éxito ───────────────────────────────────────
  ventaExitosa: boolean = false;
  ultimaVenta: { numeroDocumento: string; total: number; tipoPago: string } | null = null;

  constructor(
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarCartas();
  }

  // ── Carga catálogo ───────────────────────────────────────

  cargarCartas(): void {
    this.cargando = true;
    this.ventaService.getCartas().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.status) {
            // Solo cartas activas con stock > 0
            this.cartas = res.value.filter(c => c.esActivo && c.stock > 0);
            this.aplicarFiltro();
          } else {
            this.errorMsg = 'No se pudo cargar el catálogo.';
          }
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
  }

  // ── Filtro de búsqueda ───────────────────────────────────

  aplicarFiltro(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) {
      this.cartasFiltradas = [...this.cartas];
      return;
    }
    this.cartasFiltradas = this.cartas.filter(
      c =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcionSet?.toLowerCase().includes(q)
    );
  }

  onBusquedaChange(): void {
    this.aplicarFiltro();
  }

  // ── Carrito ──────────────────────────────────────────────

  agregarAlCarrito(carta: CartaDTO): void {
    const existente = this.carrito.find(i => i.carta.idCarta === carta.idCarta);

    if (existente) {
      if (existente.cantidad >= carta.stock) return; // no superar stock
      existente.cantidad++;
      existente.subtotal = existente.cantidad * existente.carta.precio;
    } else {
      this.carrito.push({
        carta,
        cantidad: 1,
        subtotal: carta.precio,
      });
    }
    this.cdr.detectChanges();
  }

  incrementar(item: ItemCarrito): void {
    if (item.cantidad >= item.carta.stock) return;
    item.cantidad++;
    item.subtotal = item.cantidad * item.carta.precio;
    this.cdr.detectChanges();
  }

  decrementar(item: ItemCarrito): void {
    if (item.cantidad <= 1) {
      this.eliminarDelCarrito(item);
      return;
    }
    item.cantidad--;
    item.subtotal = item.cantidad * item.carta.precio;
    this.cdr.detectChanges();
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    this.carrito = this.carrito.filter(i => i !== item);
    this.cdr.detectChanges();
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.cdr.detectChanges();
  }

  get totalCarrito(): number {
    return this.carrito.reduce((acc, i) => acc + i.subtotal, 0);
  }

  get cantidadItems(): number {
    return this.carrito.reduce((acc, i) => acc + i.cantidad, 0);
  }

  enCarrito(idCarta: number): boolean {
    return this.carrito.some(i => i.carta.idCarta === idCarta);
  }

  cantidadEnCarrito(idCarta: number): number {
    return this.carrito.find(i => i.carta.idCarta === idCarta)?.cantidad ?? 0;
  }

  // ── Registrar venta ──────────────────────────────────────

  registrarVenta(): void {
    if (this.carrito.length === 0) {
      this.errorVenta = 'El carrito está vacío.';
      return;
    }

    this.errorVenta = '';
    this.registrando = true;

    const detalles: DetalleVentaDTO[] = this.carrito.map(i => ({
      idCarta: i.carta.idCarta,
      descripcionCarta: i.carta.nombre,
      cantidad: i.cantidad,
      precio: i.carta.precio,
      total: i.subtotal,
    }));

    const payload = {
      tipoPago: this.tipoPago,
      total: this.totalCarrito,
      detalleVenta: detalles,
    };

    this.ventaService.registrar(payload).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.registrando = false;
          if (res.status) {
            this.ultimaVenta = {
              numeroDocumento: res.value.numeroDocumento,
              total: res.value.total,
              tipoPago: res.value.tipoPago,
            };
            this.ventaExitosa = true;
            this.limpiarCarrito();
            // Recargar cartas para actualizar stock
            this.cargarCartas();
          } else {
            this.errorVenta = res.msg || 'No se pudo registrar la venta.';
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.registrando = false;
          this.errorVenta = 'Error al conectar con el servidor.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  cerrarModalExito(): void {
    this.ventaExitosa = false;
    this.ultimaVenta = null;
  }

  // ── Helpers ──────────────────────────────────────────────

  formatearPrecio(valor: number | undefined): string {
    if (valor == null) return '—';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);
  }

  getStockClase(stock: number): string {
    if (stock === 0) return 'stock-vacio';
    if (stock <= 2) return 'stock-critico';
    if (stock <= 5) return 'stock-bajo';
    return 'stock-ok';
  }
}
