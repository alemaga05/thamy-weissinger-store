import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feminino',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feminino.html',
  styleUrl: './feminino.css'
})
export class Feminino {

  // 1. Bolinhas de Subcategorias
  subcategories = [
    { name: 'TOPS', image: '/categoriaFemTop.png' },
    { name: 'SHORTS', image: '/categoriaFemShort.png' },
    { name: 'LEGGINS', image: '/categoriaFemCalca.png' },
    { name: 'CONJUNTO', image: '/conjuntoFemConjunto.png' },
    { name: 'CATEGORIA', image: '/cinza.png' },
    { name: 'CATEGORIA', image: '/cinza.png' }
  ];

  // 2. Produtos em Destaque
  products = [
    { id: 31, name: 'Macacao roxo feminino', price: '79,90', image: '/macacaoroxofem.webp' },
    { id: 32, name: 'Conjunto Preto', price: '89,90', image: '/macacaopretofem.webp' },
    { id: 33, name: 'Top Preto feminino', price: '55,00', image: '/toppretofem.webp' },
    { id: 34, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
  ];
}