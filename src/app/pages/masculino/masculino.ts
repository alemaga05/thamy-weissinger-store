import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-masculino',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './masculino.html',
  styleUrl: './masculino.css'
})
export class Masculino {
  // 1. Bolinhas de Subcategorias
  subcategories = [
    { name: 'CAMISAS', image: '/masc-camisas.png' },
    { name: 'SHORTS', image: '/masc-shorts.png' },
    { name: 'REGATAS', image: '/masc-regatas.png' },
    { name: 'CONJUNTO', image: '/masc-conjunto.png' },
    { name: 'CATEGORIA', image: '/cinza.png' },
    { name: 'CATEGORIA', image: '/cinza.png' }
  ];

  // 2. Produtos em Destaque
  products = [
    { id: 21, name: 'Camiseta Poliamida', price: '79,90', image: '/prod-masc1.png' },
    { id: 22, name: 'Short Aero Pulse', price: '89,90', image: '/prod-masc2.png' },
    { id: 23, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 24, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' },
    { id: 25, name: 'nome do produto', price: '000,00', image: '/cinza-quadrado.png' }
  ];
}