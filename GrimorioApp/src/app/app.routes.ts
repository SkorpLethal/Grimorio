import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
export const routes: Routes = [
     {
        path: '', title: 'Home Page', component: Dashboard,
      },
       {
        path: 'login', title: 'Login Page', component: Login,
      },
      {
        path: 'register', title: 'Register Page', component: Register,
      },
    ];
