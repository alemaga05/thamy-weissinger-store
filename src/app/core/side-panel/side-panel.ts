import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css'
})
export class SidePanel {
  @Input() isOpen = false; 
  @Input() mode: 'cart' | 'favorites' = 'cart'; 
  @Output() close = new EventEmitter<void>();

  cartItems: any[] = [
    { 
      id: 1, 
      name: 'CONJUNTO COM TOP E CALÇA', 
      size: 'M', 
      price: 105.00, 
      quantity: 1, 
      image: '/produto1.png',
      swipeOffset: 0, // ⬅️ NOVO: Guarda o movimento do dedo
      isSwiping: false // ⬅️ NOVO: Avisa se o dedo ainda tá na tela
    }
  ];

  fecharPainel() { this.close.emit(); }
  aumentarQtd(item: any) { item.quantity++; }
  diminuirQtd(item: any) { if(item.quantity > 1) item.quantity--; }
  removerItem(item: any) { this.cartItems = this.cartItems.filter(i => i.id !== item.id); }

  get valorTotalFormatado(): string {
    const total = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return total.toFixed(2).replace('.', ','); 
  }
  formatarPreco(valor: number): string { return valor.toFixed(2).replace('.', ','); }

  // ==========================================
  // LÓGICA DO ARRASTE (SWIPE TO DELETE) NO MOBILE
  // ==========================================
  startX: number = 0;

  onTouchStart(event: TouchEvent, item: any) {
    this.startX = event.touches[0].clientX; // Marca onde o dedo encostou
    item.isSwiping = true;
    
    // Fecha a lixeira de todos os outros itens para não virar bagunça
    this.cartItems.forEach(i => { if (i.id !== item.id) i.swipeOffset = 0; });
  }

  onTouchMove(event: TouchEvent, item: any) {
    if (!item.isSwiping) return;
    const currentX = event.touches[0].clientX; // Onde o dedo tá agora
    const diff = currentX - this.startX;
    
    // Só deixa arrastar para a esquerda (número negativo)
    if (diff < 0) {
      item.swipeOffset = Math.max(diff, -80); // Limita o arraste a -80px (largura da lixeira)
    } else {
      item.swipeOffset = 0; // Se tentar puxar pra direita, não faz nada
    }
  }

  onTouchEnd(item: any) {
    item.isSwiping = false; // Tirou o dedo da tela
    
    // Se arrastou mais que a metade (-40px), o botão de lixeira "trava" aberto
    if (item.swipeOffset && item.swipeOffset < -40) {
      item.swipeOffset = -80;
    } else {
      // Se arrastou só um pouquinho e soltou, o item volta pro lugar e esconde a lixeira
      item.swipeOffset = 0;
    }
  }
}