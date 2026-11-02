import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; 
import { ProductDetails } from './pages/product-details/product-details';
import { Masculino } from './pages/masculino/masculino';
import { Feminino } from './pages/feminino/feminino';
import { Category } from './pages/category/category'; 
import { Profile } from './pages/profile/profile'; 
import { adminGuard } from './core/guards/admin.guards';
import { Checkout } from './checkout/checkout';

export const routes: Routes = [
  { path: '', component: Home }, 
  { path: 'produto/:id', component: ProductDetails }, 
  { path: 'masculino', component: Masculino },
  { path: 'feminino', component: Feminino },
  { path: 'categoria/:nome', component: Category },
  { path: 'perfil', component: Profile },
  { 
    path: 'admin/login', 
    loadComponent: () => import('./pages/admin/admin-login/admin-login').then(m => m.AdminLogin) 
  },
  { 
    path: 'admin/dashboard', 
    loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [adminGuard]
  },

  {
    path: 'checkout',
    component: Checkout
  },
];