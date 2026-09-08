import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthModal } from '../auth-modal/auth-modal'; 
import { SidePanel } from '../side-panel/side-panel';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModal, SidePanel],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Variáveis de controle de estado (Telas e Menus)
  isSidebarOpen = false;
  isModalOpen = false;
  
  // ⬅️ AQUI ESTAVA O ERRO! Faltou declarar essa variável:
  isSidePanelOpen = false; 
  
  sidePanelMode: 'cart' | 'favorites' = 'cart';

  // ⬅️ Variável que simula se o cliente está logado (Começa falsa)
  isLoggedIn = true; 

  // ==========================================
  // LÓGICA DO CARRINHO E FAVORITOS
  // ==========================================
  abrirFavoritos() {
    // Se não estiver logado, barra a ação e abre o modal de login!
    if (!this.isLoggedIn) {
      this.abrirModal();
      return; 
    }
    this.sidePanelMode = 'favorites';
    this.isSidePanelOpen = true;
  }

  abrirCarrinho() {
    // Se não estiver logado, barra a ação e abre o modal de login!
    if (!this.isLoggedIn) {
      this.abrirModal();
      return; 
    }
    this.sidePanelMode = 'cart';
    this.isSidePanelOpen = true;
  }

  fecharPainelLateral() {
    this.isSidePanelOpen = false;
  }

  // ==========================================
  // LÓGICA DO MENU CELULAR E MODAL DE LOGIN
  // ==========================================
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  abrirModal() {
    this.isModalOpen = true;
  }

  fecharModal() {
    this.isModalOpen = false;
  }
}