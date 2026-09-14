import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css'
})
export class SidePanel implements OnChanges { // <-- A correção estava aqui (implements)
  @Input() isOpen = false; 
  @Input() mode: 'cart' | 'favorites' = 'cart'; 
  @Output() close = new EventEmitter();

  cartItems: any[] = []; 

  // Banco de dados simulado (Itens do e-commerce)
  bancoDeDadosSimulado = [
    { id: 1, name: 'Colar de Prata Básico', price: 105.00, image: '/produto1.png' },
    { id: 2, name: 'Pulseira de Couro', price: 79.90, image: '/produto1.png' },
    { id: 21, name: 'Brinco Argola Ouro', price: 79.90, image: '/produto1.png' },
    { id: 31, name: 'Relógio Minimalista', price: 79.90, image: '/prod-masc1.png' },
    { id: 32, name: 'Anel Folheado Vintage', price: 89.90, image: '/prod-masc2.png' }
  ];

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.carregarItens();
    }
  }

  carregarItens() {
    const token = localStorage.getItem('token');
    if (!token) return; 

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const url = this.mode === 'cart' 
      ? 'http://localhost:3000/carrinho' 
      : 'http://localhost:3000/favoritos';

    this.http.get(url, { headers }).subscribe({
      next: (itensDoBanco: any) => {
        this.cartItems = itensDoBanco.map((itemDb: any) => {
          const produtoInfo = this.bancoDeDadosSimulado.find(p => p.id === itemDb.produtoId) || 
                    { id: 0, name: 'Produto Indisponível', price: 0, image: '/cinza.png' };
          return {
            idDb: itemDb.id, 
            id: produtoInfo.id,
            name: produtoInfo.name,
            size: itemDb.tamanho || 'Único', 
            price: produtoInfo.price,
            quantity: itemDb.quantidade || 1, 
            image: produtoInfo.image,
            swipeOffset: 0, 
            isSwiping: false 
          };
        });
      },
      error: (err) => console.error('Erro ao buscar painel:', err)
    });
  }

  fecharPainel() { this.close.emit(); }
  
  aumentarQtd(item: any) { item.quantity++; }
  
  diminuirQtd(item: any) { if(item.quantity > 1) item.quantity--; }
  
  removerItem(item: any) { 
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = this.mode === 'cart' 
      ? `http://localhost:3000/carrinho/${item.idDb}` 
      : `http://localhost:3000/favoritos/${item.idDb}`;
    
    // Por enquanto, apaga só da tela visualmente:
    this.cartItems = this.cartItems.filter(i => i.idDb !== item.idDb);
  }

  get valorTotalFormatado(): string {
    const total = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return total.toFixed(2).replace('.', ','); 
  }
  
  formatarPreco(valor: number): string { 
    return valor.toFixed(2).replace('.', ','); 
  }

  // ==========================================
  // LÓGICA DE ARRASTAR PARA O LADO (SWIPE)
  // ==========================================
  startX: number = 0;

  onTouchStart(event: TouchEvent, item: any) {
    this.startX = event.touches[0].clientX; 
    item.isSwiping = true;

    // Fecha qualquer outro item que estiver aberto
    this.cartItems.forEach(i => { if (i.id !== item.id) i.swipeOffset = 0; });
  }

  onTouchMove(event: TouchEvent, item: any) {
    if (!item.isSwiping) return;
    const currentX = event.touches[0].clientX; 
    const diff = currentX - this.startX;

    if (diff < 0) {
      item.swipeOffset = Math.max(diff, -80); 
    } else {
      item.swipeOffset = 0; 
    }
  }

  onTouchEnd(item: any) {
    item.isSwiping = false; 

    if (item.swipeOffset && item.swipeOffset < -40) {
      item.swipeOffset = -80; // Trava a lixeira aberta
    } else {
      item.swipeOffset = 0; // Volta ao normal
    }
  }
}