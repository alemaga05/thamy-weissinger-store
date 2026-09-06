import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; 
import { ProductDetails } from './pages/product-details/product-details';
import { Masculino } from './pages/masculino/masculino';

export const routes: Routes = [
  { path: '', component: Home }, 
  { path: 'produto/:id', component: ProductDetails }, 
  { path: 'masculino', component: Masculino },
];