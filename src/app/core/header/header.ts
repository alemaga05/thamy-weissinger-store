import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ⬅️ Adicionado

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule], // ⬅️ Adicionado
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Variável que controla a barra lateral no celular
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}