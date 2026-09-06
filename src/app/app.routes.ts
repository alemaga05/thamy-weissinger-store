import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; 
import { ProductDetails } from './pages/product-details/product-details';

export const routes: Routes = [
  { path: '', component: Home }, 
  { path: 'produto/:id', component: ProductDetails } // ⬅️ Adicionamos o /:id aqui!
];