import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para o *ngFor
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorite-feminino',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorite-feminino.html',
  styleUrl: './favorite-feminino.css'
})
export class FavoriteFeminino {
  // Dados específicos para a seção de Destaques Femininos
  products = [
    { id: 1, name: 'CJ CALCA RAIANE', price: '69,00', image: 'https://images.tcdn.com.br/img/img_prod/858299/conjunto_fitness_wine_glow_top_calca_337_5_ad66b976c02500139eb7297aa9694384.jpg' },
    { id: 2, name: 'TOP tye', price: '29,90', image: '/produto1.png' },
    { id: 3, name: 'CJ CALÇA FLARE', price: '89,90', image: '/produto1.png' },
    { id: 4, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 5, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    // Produtos de teste para preencher a segunda linha
    { id: 6, name: 'nome do produto', price: '000,00', image: '/produto1.png' },
    { id: 7, name: 'nome do produto', price: '000,00', image: '/produto1.png' },
    { id: 8, name: 'nome do produto', price: '000,00', image: '/produto1.png' },
    { id: 9, name: 'nome do produto', price: '000,00', image: '/produto1.png' },
    { id: 10, name: 'nome do produto', price: '000,00', image: '/produto1.png' },
  ];
}