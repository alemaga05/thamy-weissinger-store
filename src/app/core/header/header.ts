import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ⬅️ Necessário para os links do header funcionarem
import { AuthModal } from '../auth-modal/auth-modal'; // ⬅️ Importa o Modal (ajuste o caminho se a pasta for diferente)

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModal], // ⬅️ Adicionado RouterModule e AuthModal
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Variável que controla a barra lateral no celular
  isSidebarOpen = false;

  // ⬅️ NOVA: Variável que controla o Modal de Login/Cadastro
  isModalOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // ⬅️ NOVAS: Funções para abrir e fechar o modal
  abrirModal() {
    this.isModalOpen = true;
  }

  fecharModal() {
    this.isModalOpen = false;
  }
}