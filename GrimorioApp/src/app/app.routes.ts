import { Routes } from '@angular/router';
import { Layout }    from './layout/layout';
import { Login }     from './login/login';
import { Register }  from './register/register';
import { Dashboard } from './layout/pages/dashboard/dashboard';
import { Usuarios }  from './layout/pages/usuarios/usuarios';
import { Productos } from './layout/pages/productos/productos';
import { Venta } from './layout/pages/ventas/ventas';
import { HistorialVenta } from './layout/pages/historial/historial_venta';
import { Reportes } from './layout/pages/reportes/reportes';

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
      { path: 'venta', component: Venta },
      { path: 'historial_venta', component: HistorialVenta },
      { path: 'reportes', component: Reportes }
    ],
  },
  { path: '**', redirectTo: 'login' },
];
