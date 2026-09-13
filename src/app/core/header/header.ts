import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthModal } from '../auth-modal/auth-modal'; 
import { SidePanel } from '../side-panel/side-panel';
import { Router } from '@angular/router';

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
  
  isSidePanelOpen = false; 
  sidePanelMode: 'cart' | 'favorites' = 'cart';

  // Variável que simula se o cliente está logado
  isLoggedIn = true; 

  // ⬅️ NOVO: Injetando o Router para conseguirmos mudar de página pelo TypeScript
  constructor(private router: Router) {}

  // ⬅️ NOVO: Lógica inteligente do botão de perfil
  clicarNoPerfil() {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Se achou o crachá (token), vai direto para o painel de perfil
      this.router.navigate(['/perfil']); 
    } else {
      // Se não tem crachá, abre a tela de login
      this.abrirModal(); 
    }
  }

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