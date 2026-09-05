import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para o *ngFor

@Component({
  selector: 'app-popular-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-products.html',
  styleUrl: './popular-products.css'
})
export class PopularProducts {
  // Mock de dados: Simulando o que virá do banco de dados no futuro
  products = [
    { id: 1, name: 'Conjunto azul', price: '105,00', image: '/produto1.png' },
    { id: 2, name: 'Camiseta Poliamida', price: '79,90', image: '/produto1.png' },
    { id: 3, name: 'Short Aero Pulse', price: '89,90', image: '/produto1.png' },
    { id: 4, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 5, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 7, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 8, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 9, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    { id: 10, name: 'Top preto', price: '65,00', image: '/produto1.png' },
    // Você pode adicionar mais itens aqui para completar as duas fileiras!
  ];
}