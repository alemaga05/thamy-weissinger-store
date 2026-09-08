import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  // Recebe do componente pai se o modal deve aparecer ou não
  @Input() isOpen = false; 
  
  // Avisa o componente pai para fechar o modal
  @Output() close = new EventEmitter<void>();

  // Controla se estamos na tela de Login (true) ou Cadastro (false)
  isLoginView = true;

  fecharModal() {
    this.close.emit();
    // Reseta para a tela de login ao fechar
    setTimeout(() => this.isLoginView = true, 300); 
  }

  alternarTela() {
    this.isLoginView = !this.isLoginView;
  }
}