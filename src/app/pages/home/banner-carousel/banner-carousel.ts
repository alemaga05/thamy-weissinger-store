import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.css'
})
export class BannerCarousel implements OnInit, OnDestroy {
  slides = [
    { id: 1, url: '/banner1.jpg', alt: 'Conforto, Performance e Estilo' },
    { id: 2, url: '/banner1.jpg', alt: 'Moda Fitness Feminina' },
    { id: 3, url: '/banner1.jpg', alt: 'Coleção Masculina' }
  ];

  currentIndex = 0;
  autoPlayInterval: any;

  // Variáveis para rastrear o toque na tela
  touchStartX = 0;
  touchEndX = 0;

  ngOnInit() { this.startAutoPlay(); }
  ngOnDestroy() { this.stopAutoPlay(); }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => { this.nextSlide(); }, 5000); 
  }

  stopAutoPlay() { clearInterval(this.autoPlayInterval); }

  nextSlide() {
    this.currentIndex = (this.currentIndex === this.slides.length - 1) ? 0 : this.currentIndex + 1;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex === 0) ? this.slides.length - 1 : this.currentIndex - 1;
  }

  // ==========================================
  // LÓGICA DO ARRASTAR (SWIPE) NO CELULAR
  // ==========================================
  
  onTouchStart(event: TouchEvent) {
    // Marca a posição inicial do dedo na tela
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    // Marca a posição final de quando o usuário soltou o dedo
    this.touchEndX = event.changedTouches[0].screenX;
    this.checkDirection();
  }

  checkDirection() {
    const minSwipeDistance = 50; // Distância mínima para não contar um toque acidental

    if (this.touchEndX < this.touchStartX - minSwipeDistance) {
      // Dedo foi para a esquerda: avança a foto
      this.nextSlide(); 
    } else if (this.touchEndX > this.touchStartX + minSwipeDistance) {
      // Dedo foi para a direita: volta a foto
      this.prevSlide(); 
    }
  }
}