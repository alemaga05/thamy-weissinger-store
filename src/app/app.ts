import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componentes Globais (Core)
import { Header } from './core/header/header'; 
import { Footer } from './core/footer/footer'; 

// Componentes da Página Inicial (Pages/Home)
import { BannerCarousel } from './pages/home/banner-carousel/banner-carousel'; 
import { Categories } from './pages/home/categories/categories';
import { PopularProducts } from './pages/home/popular-products/popular-products';
import { FavoriteFeminino } from './pages/home/favorite-feminino/favorite-feminino'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    Header, 
    Footer, 
    BannerCarousel, 
    Categories, 
    PopularProducts, 
    FavoriteFeminino 
  ], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { 
  title = 'thamy-weissinger-store';
}