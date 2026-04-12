import { Routes } from '@angular/router';
import { Layout }    from './layout/layout';
import { Login }     from './login/login';
import { Register }  from './register/register';
import { Dashboard } from './layout/pages/dashboard/dashboard';
import { Usuarios }  from './layout/pages/usuarios/usuarios';
import { Productos } from './layout/pages/productos/productos';
import { Venta } from './layout/pages/ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',    component: Login },
  { path: 'register', component: Register },
  {
    path: 'pages',
    component: Layout,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'usuarios',  component: Usuarios },
      { path: 'productos', component: Productos },
      { path: 'venta', component: Venta},
      // Páginas pendientes de implementar — se añadirán iterativamente
      // { path: 'historial_venta',component: HistorialVenta },
      // { path: 'reportes',       component: Reportes },
      /*    { path: 'sets', component: SetsComponent },
            { path: 'set/:idSet', component: CartasComponent },
            { path: 'set/:idSet/carta/:idCarta', component: CartaComponent },
            { path: 'set/:idSet/carta/nueva', component: CartaComponent },
            { path: 'ventas', component: VentasComponent },
            { path: 'historial', component: HistorialComponent },
            { path: 'reporte', component: ReporteComponent }*/
    ],
  },
  { path: '**', redirectTo: 'login' },
];
