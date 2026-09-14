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
    { name: 'CAMISAS', image: '/categoriaMascCamisa.png' },
    { name: 'SHORTS', image: '/categoriaMascShort.png' },
    { name: 'REGATAS', image: '/categoriaMascRegata.png' },
    { name: 'CONJUNTO', image: '/categoriaMascConjunto.png' },
    { name: 'CATEGORIA', image: '/cinza.png' },
    { name: 'CATEGORIA', image: '/cinza.png' }
  ];

  // 2. Produtos em Destaque
  products = [
    { id: 21, name: 'regata masculina', price: '79,90', image: '/blusa regata.webp' },
    { id: 22, name: 'Short Masculino', price: '89,90', image: '/shortmasculino.webp' },
    { id: 23, name: 'Calça Masculina', price: '100,00', image: '/calcaomasculina.webp' },
    { id: 24, name: 'blusa oversize Masculina', price: '75,00', image: '/oversize.webp' },
    
  ];
}