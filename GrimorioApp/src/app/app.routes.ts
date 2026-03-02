import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './login/login';
import { Dashboard } from './layout/pages/dashboard/dashboard';
import { Register } from './register/register';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    {
        path: 'pages',
        component: Layout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },

            // Solo Administrador
            /*{ path: 'usuarios', component: UsuariosComponent, },

            { path: 'sets', component: SetsComponent },
            { path: 'set/:idSet', component: CartasComponent },
            { path: 'set/:idSet/carta/:idCarta', component: CartaComponent },
            { path: 'set/:idSet/carta/nueva', component: CartaComponent },
            { path: 'ventas', component: VentasComponent },
            { path: 'historial', component: HistorialComponent },
            { path: 'reporte', component: ReporteComponent }*/
        ]
    },

    { path: '**', redirectTo: 'login' }
];
