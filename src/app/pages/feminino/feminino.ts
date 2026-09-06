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
    { id: 31, name: 'Camiseta Poliamida', price: '79,90', image: '/prod-masc1.png' },
    { id: 32, name: 'Short Aero Pulse', price: '89,90', image: '/prod-masc2.png' },
    { id: 33, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 34, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 35, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' }, 
    { id: 36, name: 'Camiseta Poliamida', price: '79,90', image: '/prod-masc1.png' },
    { id: 37, name: 'Short Aero Pulse', price: '89,90', image: '/prod-masc2.png' },
    { id: 38, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 39, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 40, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' }, 
  ];
}