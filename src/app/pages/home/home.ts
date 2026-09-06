import { Component } from '@angular/core';
import { BannerCarousel } from './banner-carousel/banner-carousel'; 
import { Categories } from './categories/categories';
import { PopularProducts } from './popular-products/popular-products';
import { FavoriteFeminino } from './favorite-feminino/favorite-feminino';
// Se tiver o favorite-feminino, importe ele aqui também!

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerCarousel, Categories, PopularProducts, FavoriteFeminino], 
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}